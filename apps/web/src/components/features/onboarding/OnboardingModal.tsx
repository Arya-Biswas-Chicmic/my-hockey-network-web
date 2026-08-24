import React, { useState } from 'react';
import { OnboardingIllustration } from './OnboardingIllustration';
import { RoleSelectionForm } from './RoleSelectionForm';
import { CreateAccountForm, VerifyEmailForm, LoginForm, GuardianApprovalModal, RequestSentCard } from '../auth';
import { DEFAULT_ROLE_OPTIONS, DEFAULT_SELECTED_ROLE_IDS } from '../../../constants/onboarding';
import { requestOtp, verifyOtp, submitOnboarding, sendGuardianRequest, calculateAge, UserRole } from '@my-hockey-network/core';
import type { OtpVerifyResponse } from '@my-hockey-network/contracts';
import { webAuthStorage } from '../../../platform/auth-storage';
import { useAuth } from '../../../hooks/use-auth';

interface OnboardingModalProps {
  onComplete?: (data: { selectedRoles: string[]; accountData?: { fullName: string; email: string; dob: string; parentEmail?: string }; onboardingResult?: any }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { setAuthSession, loadAuthMe, showToast } = useAuth();
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('signup');
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1: Role, 2: CreateAccount, 3: VerifyOTP, 4: GuardianApproval, 5: RequestSent
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

  // Mode Switch Handlers
  const handleSwitchToLogin = () => {
    setAuthMode('login');
    setLoginStep(1);
    setErrorMessage(null);
  };

  const handleSwitchToSignup = () => {
    setAuthMode('signup');
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
      await requestOtp({
        channel: 'EMAIL',
        destination: data.email,
        intent: 'SIGNUP',
      });
      setStep(3);
    } catch (err: any) {
      if (err.statusCode === 409 || err.key === 'USER_ALREADY_EXISTS') {
        setErrorMessage('An account with this email already exists. Switching to Sign In...');
        setTimeout(() => {
          setLoginEmail(data.email);
          handleSwitchToLogin();
        }, 1200);
      } else {
        setErrorMessage(err.message || 'Failed to send verification code. Please check details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDobToIso = (dobStr: string): string | undefined => {
    if (!dobStr) return undefined;
    const parts = dobStr.split('/');
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }
    return dobStr;
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

      // Check if user is minor (< 18)
      const age = calculateAge(accountData.dob);
      const roleUpper = (selectedRoles[0] || 'PLAYER').toUpperCase();
      const isMinorUser = (roleUpper === 'PLAYER' || roleUpper === 'COACH' || roleUpper === 'STAFF') && age !== null && age >= 5 && age < 18;

      if (isMinorUser) {
        // Post-OTP: Move to Guardian Approval Request Screen
        setStep(4);
      } else {
        // Adult: Complete Onboarding immediately
        await finalizeOnboarding(undefined, verifyRes);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const finalizeOnboarding = async (parentEmail?: string, sessionToSave?: OtpVerifyResponse) => {
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

      const onboardingResult = await submitOnboarding({
        roles: apiRoles.length > 0 ? apiRoles : ['PLAYER'],
        displayName: accountData.fullName || 'User',
        dateOfBirth: isoDob,
        parentEmail,
        preferredLanguage: 'en',
      });

      if (activeSession) {
        setAuthSession(activeSession);
      }

      await loadAuthMe(true, true);

      if (onComplete) {
        onComplete({ selectedRoles, accountData: { ...accountData, parentEmail }, onboardingResult });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to complete profile onboarding.');
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
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to send guardian request. Please check email address.');
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
      await requestOtp({
        channel: 'EMAIL',
        destination: email,
        intent: 'SIGNIN',
      });
      setLoginStep(2);
    } catch (err: any) {
      if (err.statusCode === 404 || err.key === 'USER_NOT_FOUND') {
        setErrorMessage('No account found with this email. Please Sign Up first.');
      } else {
        setErrorMessage(err.message || 'Failed to send login code. Please check email and try again.');
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
        setAuthSession(verifyRes);
      }

      if (onComplete) {
        onComplete({ selectedRoles: ['PLAYER'], accountData: { fullName: 'User', email: loginEmail, dob: '' } });
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification code invalid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const targetEmail = authMode === 'login' ? loginEmail : accountData.email;
    if (!targetEmail) return;

    setLoading(true);
    setErrorMessage(null);
    setResendNotice(null);

    try {
      await requestOtp({
        channel: 'EMAIL',
        destination: targetEmail,
        intent: authMode === 'login' ? 'SIGNIN' : 'SIGNUP',
      });
      const msg = `A new verification code was sent to ${targetEmail}`;
      setResendNotice(msg);
      showToast(msg, 'success');
    } catch (err: any) {
      const msg = err.message || `Failed to send verification code to ${targetEmail}. Please try again.`;
      setErrorMessage(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const currentSelectedRole = selectedRoles[0] || 'player';

  return (
    <div className="onboarding-modal">
      {step !== 4 && step !== 5 && (
        <OnboardingIllustration
          imageSrc={
            (authMode === 'signup' && step === 3) || (authMode === 'login' && loginStep === 2)
              ? '/OTPbg.png'
              : '/Welcome.png'
          }
        />
      )}

      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FEF2F2',
            color: '#DC2626',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            zIndex: 10,
            border: '1px solid #FCA5A5',
          }}
        >
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
              onBack={handleSwitchToLogin}
            />
          )}
          {step === 2 && (
            <CreateAccountForm
              selectedRole={currentSelectedRole}
              onSignUp={handleSignUp}
              onGoogleSignIn={() => setStep(3)}
              onBack={() => setStep(1)}
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
            />
          )}
        </>
      )}
    </div>
  );
};
