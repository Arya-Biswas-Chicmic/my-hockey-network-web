import React, { useState } from 'react';
import { useTheme } from '@/components/core/theme-provider';
import { OnboardingIllustration } from '@/components/features/onboarding/OnboardingIllustration';
import { RoleSelectionForm } from '@/components/features/onboarding/RoleSelectionForm';
import { CreateAccountForm, VerifyEmailForm, LoginForm, GuardianApprovalModal, RequestSentCard } from '@/components/features/auth';
import { ParentOnboardingModal } from '@/components/features/parent';
import { DEFAULT_ROLE_OPTIONS, DEFAULT_SELECTED_ROLE_IDS } from '@/constants/onboarding';
import { requestOtp, verifyOtp, submitOnboarding, sendGuardianRequest, calculateAge, UserRole } from '@my-hockey-network/core';
import { type AuthMeResponse, type OnboardingResponse, type OtpVerifyResponse, AuthModeEnum } from '@my-hockey-network/contracts';
import { webAuthStorage } from '@/platform/auth-storage';
import { useAuth } from '@/hooks/use-auth';
import { formatDobToIso } from '@/utils/guardianUtils';
import { extractErrorMessage, getApiErrorKey, getApiErrorStatus } from '@/utils/toast';

interface OnboardingModalProps {
  initialMode?: 'signup' | 'login';
  onComplete?: (data: { selectedRoles: string[]; accountData?: { fullName: string; email: string; dob: string; parentEmail?: string }; onboardingResult?: OnboardingResponse | AuthMeResponse; redirectProfileId?: string }) => void;
}

function getIllustrationSource(step: number, authMode: AuthModeEnum, loginStep: number, isDark: boolean): string {
  if (step >= 4) return '/empowering.png';
  if (isDark) return '/IceHockeyDark.png';
  const isOtpStep = (authMode === AuthModeEnum.SIGNUP && step === 3)
    || (authMode === AuthModeEnum.LOGIN && loginStep === 2);
  return isOtpStep ? '/OTPbg.png' : '/Welcome.png';
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ initialMode = AuthModeEnum.LOGIN, onComplete }) => {
  const { setAuthSession, loadAuthMe, showToast } = useAuth();
  const { resolvedTheme } = useTheme();
  const [authMode, setAuthMode] = useState<AuthModeEnum>(String(initialMode) === 'signup' ? AuthModeEnum.SIGNUP : AuthModeEnum.LOGIN);
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1); // 1: Role, 2: CreateAccount, 3: VerifyOTP, 4: GuardianApproval, 5: RequestSent, 6: ParentOnboarding
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  const [selectedRoles, setSelectedRoles] = useState<string[]>(DEFAULT_SELECTED_ROLE_IDS);
  const [accountData, setAccountData] = useState<{
    fullName: string;
    email: string;
    dob: string;
    parentEmail?: string;
  }>({
    fullName: '',
    email: '',
    dob: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Backend-issued OTP returned directly in the request response while no
  // email service is wired up (see OtpRequestResponse.devCode/code) —
  // prefilled into VerifyEmailForm so testers only need to press Confirm.
  // Remove once real email delivery is live; the backend should stop
  // returning this field in that environment.
  const [devOtpCode, setDevOtpCode] = useState<string | null>(null);
  const [hasCompletedPreOnboarding, setHasCompletedPreOnboarding] = useState<boolean>(false);

  // Mode Switch Handlers
  const handleSwitchToLogin = () => {
    setAuthMode(AuthModeEnum.LOGIN);
    setLoginStep(1);
    setErrorMessage(null);
  };

  const handleSwitchToSignup = () => {
    setAuthMode(AuthModeEnum.SIGNUP);
    setStep(1);
    setErrorMessage(null);
  };

  // Sign Up Handlers
  const handleToggleRole = (id: string) => {
    setSelectedRoles([id]);
  };

  const handleRoleSelectionContinue = () => {
    setStep(2);
  };

  const handleSignUp = async (data: { fullName: string; email: string; dob: string }) => {
    setAccountData(data);
    setLoading(true);
    setErrorMessage(null);

    try {
      // Send OTP Request (SIGNUP)
      const otpRes = await requestOtp({
        channel: 'EMAIL',
        destination: data.email,
        intent: 'SIGNUP',
      });
      setDevOtpCode(otpRes?.devCode ?? otpRes?.code ?? null);
      setStep(3);
    } catch (err: unknown) {
      if (getApiErrorStatus(err) === 409 || getApiErrorKey(err) === 'USER_ALREADY_EXISTS') {
        setErrorMessage(extractErrorMessage(err, 'An account with this email already exists. Please sign in or use a different email.'));
      } else {
        setErrorMessage(extractErrorMessage(err, 'Failed to send verification code. Please check details and try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const [verifiedSession, setVerifiedSession] = useState<OtpVerifyResponse | null>(null);

  // Step 3: Verify OTP
  const handleVerifyConfirm = async (code: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      // Verify OTP (SIGNUP)
      const verifyRes = await verifyOtp({
        channel: 'EMAIL',
        destination: accountData.email,
        code,
        intent: 'SIGNUP',
      });

      if (verifyRes) {
        setVerifiedSession(verifyRes);
        webAuthStorage.saveSession(verifyRes);
      }

      // Check user role and age
      const age = calculateAge(accountData.dob);
      const roleUpper = (selectedRoles[0] || 'PLAYER').toUpperCase();
      const isMinorUser = (roleUpper === 'PLAYER' || roleUpper === 'COACH' || roleUpper === 'STAFF') && age !== null && age >= 5 && age < 18;
      const isParentUser = roleUpper === 'PARENT';

      if (isMinorUser) {
        // Post-OTP: Move to Guardian Approval Request Screen
        setStep(4);
      } else if (isParentUser) {
        // Submit Parent Onboarding first to create Parent account & obtain mhn_at token for webAuthStorage
        try {
          const isoDob = formatDobToIso(accountData.dob);
          const onboardingRes = await submitOnboarding({
            roles: ['PARENT'],
            displayName: accountData.fullName || 'Parent',
            dateOfBirth: isoDob,
            preferredLanguage: 'en',
          });
          if (onboardingRes) setHasCompletedPreOnboarding(true);
        } catch (onboardingErr: unknown) {
          console.warn('Parent onboarding pre-submit notice:', onboardingErr);
          const is409 = getApiErrorStatus(onboardingErr) === 409 || extractErrorMessage(onboardingErr).toLowerCase().includes('already');
          if (is409) {
            setHasCompletedPreOnboarding(true);
          }
        }
        setStep(6);
      } else {
        // Adult: Complete Onboarding immediately
        await finalizeOnboarding(undefined, verifyRes);
      }
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, 'Verification failed. Please check your code and try again.'));
    } finally {
      setLoading(false);
    }
  };

  const finalizeOnboarding = async (parentEmail?: string, sessionToSave?: OtpVerifyResponse, redirectProfileId?: string) => {
    setLoading(true);
    try {
      const activeSession = sessionToSave || verifiedSession;
      if (activeSession) {
        webAuthStorage.saveSession(activeSession);
      }

      const apiRoles: UserRole[] = selectedRoles.map((r) => {
        const upper = r.toUpperCase();
        if (['PLAYER', 'PARENT', 'COACH', 'STAFF'].includes(upper)) {
          return upper as UserRole;
        }
        return 'PLAYER';
      });

      const isoDob = formatDobToIso(accountData.dob);

      let onboardingResult: OnboardingResponse | undefined;
      if (!hasCompletedPreOnboarding) {
        try {
          onboardingResult = await submitOnboarding({
            roles: apiRoles.length > 0 ? apiRoles : ['PLAYER'],
            displayName: accountData.fullName || 'User',
            dateOfBirth: isoDob,
            parentEmail,
            preferredLanguage: 'en',
          });
          setHasCompletedPreOnboarding(true);
        } catch (err: unknown) {
          // If onboarding was already completed (e.g. pre-submitted in step 3 or by backend), treat 409 as success
          const is409 = getApiErrorStatus(err) === 409 || extractErrorMessage(err).toLowerCase().includes('already');
          if (!is409) {
            throw err;
          }
        }
      }

      if (activeSession) setAuthSession(activeSession);

      await loadAuthMe(true, true);

      if (onComplete) {
        onComplete({ selectedRoles, accountData: { ...accountData, parentEmail }, onboardingResult, redirectProfileId });
      }
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, 'Failed to complete profile onboarding.'));
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Guardian Approval Modal Handlers
  const handleSendGuardianRequest = async (parentEmail: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      await sendGuardianRequest(parentEmail);
      setAccountData((prev) => ({ ...prev, parentEmail }));
      // Move to Step 5: Request Sent! Confirmation Card (Image 2 right screen)
      setStep(5);
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, 'Failed to send guardian request. Please check email address.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSkipGuardian = async () => {
    await finalizeOnboarding();
  };

  // Step 5: Request Sent Handlers
  const handleRequestSentContinue = async () => {
    await finalizeOnboarding(accountData.parentEmail);
  };

  // Login Handlers
  const handleLoginSubmit = async (email: string) => {
    setLoginEmail(email);
    setLoading(true);
    setErrorMessage(null);

    try {
      const otpRes = await requestOtp({
        channel: 'EMAIL',
        destination: email,
        intent: 'SIGNIN',
      });
      setDevOtpCode(otpRes?.devCode ?? otpRes?.code ?? null);
      setLoginStep(2);
    } catch (err: unknown) {
      if (getApiErrorStatus(err) === 404 || getApiErrorKey(err) === 'USER_NOT_FOUND') {
        setErrorMessage('No account found with this email. Please Sign Up first.');
      } else {
        setErrorMessage(extractErrorMessage(err, 'Failed to send login code. Please check email and try again.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLoginConfirm = async (code: string) => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const verifyRes = await verifyOtp({
        channel: 'EMAIL',
        destination: loginEmail,
        code,
        intent: 'SIGNIN',
      });

      if (verifyRes) {
        webAuthStorage.saveSession(verifyRes);
        setAuthSession(verifyRes);
      }

      const profile = await loadAuthMe(true, true);

      if (onComplete) {
        onComplete({
          selectedRoles: profile?.roleAssignments?.map((r) => r.role) || ['PLAYER'],
          accountData: { fullName: profile?.profile?.displayName || 'User', email: loginEmail, dob: '' },
          onboardingResult: profile ?? undefined,
        });
      }
    } catch (err: unknown) {
      setErrorMessage(extractErrorMessage(err, 'Verification code invalid. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Returns whether a new code was actually sent, so `VerifyEmailForm` restarts
   * its resend cooldown only on success rather than locking the user out after a
   * failed request.
   */
  const handleResendCode = async (): Promise<boolean> => {
    const targetEmail = authMode === 'login' ? loginEmail : accountData.email;
    if (!targetEmail) return false;

    setLoading(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      const otpRes = await requestOtp({
        channel: 'EMAIL',
        destination: targetEmail,
        intent: authMode === 'login' ? 'SIGNIN' : 'SIGNUP',
      });
      setDevOtpCode(otpRes?.devCode ?? otpRes?.code ?? null);
      const msg = `A new verification code was sent to ${targetEmail}`;
      setResendNotice(msg);
      showToast(msg, 'success');
      return true;
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, `Failed to send verification code to ${targetEmail}. Please try again.`);
      setErrorMessage(msg);
      showToast(msg, 'error');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const currentSelectedRole = selectedRoles[0] || 'player';

  return (
    <div className="onboarding-modal">
      {step !== 4 && step !== 5 && (
        <OnboardingIllustration
          imageSrc={getIllustrationSource(step, authMode, loginStep, resolvedTheme === 'dark')}
        />
      )}

      {errorMessage && (
        <div className="mhn-error-banner-top">
          {errorMessage}
        </div>
      )}

      {/* SIGN UP FLOW */}
      {authMode === 'signup' && (
        <>
          {step === 1 && (
            <RoleSelectionForm
              roleOptions={DEFAULT_ROLE_OPTIONS}
              selectedRoles={selectedRoles}
              onToggleRole={handleToggleRole}
              onContinue={handleRoleSelectionContinue}
            />
          )}
          {step === 2 && (
            <CreateAccountForm
              selectedRole={currentSelectedRole}
              onSignUp={handleSignUp}
              onGoogleSignIn={() => setStep(3)}
              onSignInClick={handleSwitchToLogin}
              loading={loading}
            />
          )}
          {step === 3 && (
            <VerifyEmailForm
              email={accountData.email || 'player@email.com'}
              onConfirm={handleVerifyConfirm}
              onChangeEmail={() => setStep(2)}
              onResendCode={handleResendCode}
              loading={loading}
              errorMessage={errorMessage}
              resendNotice={resendNotice}
              onResendNoticeExpire={() => setResendNotice(null)}
              prefillCode={devOtpCode}
            />
          )}
          {step === 4 && (
            <GuardianApprovalModal
              onSendRequest={handleSendGuardianRequest}
              onSignOut={handleSwitchToLogin}
              loading={loading}
            />
          )}
          {step === 5 && (
            <RequestSentCard
              onContinue={handleRequestSentContinue}
              onSelectTournament={handleRequestSentContinue}
              onSelectCommunity={handleRequestSentContinue}
              loading={loading}
            />
          )}
          {step === 6 && (
            <ParentOnboardingModal
              isStandaloneModal={false}
              onComplete={(data) => finalizeOnboarding(undefined, undefined, data?.playerId)}
              onClose={() => finalizeOnboarding()}
            />
          )}
        </>
      )}

      {/* LOGIN FLOW */}
      {authMode === 'login' && (
        <>
          {loginStep === 1 && (
            <LoginForm
              onSignIn={handleLoginSubmit}
              onGoogleSignIn={() => setLoginStep(2)}
              onSignUpClick={handleSwitchToSignup}
              loading={loading}
              errorMessage={errorMessage}
            />
          )}
          {loginStep === 2 && (
            <VerifyEmailForm
              email={loginEmail || 'user@email.com'}
              onConfirm={handleVerifyLoginConfirm}
              onChangeEmail={() => setLoginStep(1)}
              onResendCode={handleResendCode}
              loading={loading}
              errorMessage={errorMessage}
              resendNotice={resendNotice}
              onResendNoticeExpire={() => setResendNotice(null)}
              prefillCode={devOtpCode}
            />
          )}
        </>
      )}
    </div>
  );
};
