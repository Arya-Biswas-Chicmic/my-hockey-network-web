import React, { useState } from 'react';
import { OnboardingIllustration } from './OnboardingIllustration';
import { RoleSelectionForm } from './RoleSelectionForm';
import { CreateAccountForm, VerifyEmailForm, LoginForm } from '../auth';
import { DEFAULT_ROLE_OPTIONS, DEFAULT_SELECTED_ROLE_IDS } from '../../../constants/onboarding';
import { requestOtp, verifyOtp, submitOnboarding, saveAuthSession, UserRole } from '@my-hockey-network/core';
import { useAuth } from '../../../context/AuthContext';

interface OnboardingModalProps {
  onComplete?: (data: { selectedRoles: string[]; accountData?: { fullName: string; email: string; dob: string }; onboardingResult?: any }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onComplete }) => {
  const { setAuthSession } = useAuth();
  const [authMode, setAuthMode] = useState<'signup' | 'login'>('login');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [loginStep, setLoginStep] = useState<1 | 2>(1);
  const [loginEmail, setLoginEmail] = useState<string>('');

  const [selectedRoles, setSelectedRoles] = useState<string[]>(DEFAULT_SELECTED_ROLE_IDS);
  const [accountData, setAccountData] = useState<{ fullName: string; email: string; dob: string }>({
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
      // 1. Send OTP Request to API (SIGNUP)
      await requestOtp({
        channel: 'EMAIL',
        destination: data.email,
        intent: 'SIGNUP',
      });
      setStep(3);
    } catch (err: any) {
      console.error('API requestOtp Error:', err);
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
        setAuthSession(verifyRes);
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
        displayName: accountData.fullName || 'Player',
        dateOfBirth: isoDob,
        preferredLanguage: 'en',
      });

      if (onComplete) {
        onComplete({ selectedRoles, accountData, onboardingResult });
      }
    } catch (err: any) {
      console.error('API Verification Error:', err);
      setErrorMessage(err.message || 'Verification failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  // Login Handlers (NO ROLE SELECTION STEP NEEDED!)
  const handleLoginSubmit = async (email: string) => {
    setLoginEmail(email);
    setLoading(true);
    setErrorMessage(null);

    try {
      // Send OTP Request to API (SIGNIN)
      await requestOtp({
        channel: 'EMAIL',
        destination: email,
        intent: 'SIGNIN',
      });
      // Move to Step 2: OTP Verification
      setLoginStep(2);
    } catch (err: any) {
      console.error('API requestOtp Login Error:', err);
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
      // Verify OTP with API (SIGNIN)
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
      console.error('API Login OTP Verification Error:', err);
      setErrorMessage(err.message || 'Verification code invalid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const targetEmail = authMode === 'login' ? loginEmail : accountData.email;
    if (!targetEmail) return;
    try {
      await requestOtp({
        channel: 'EMAIL',
        destination: targetEmail,
        intent: authMode === 'login' ? 'SIGNIN' : 'SIGNUP',
      });
      alert(`A new verification code was sent to ${targetEmail}`);
    } catch (err: any) {
      alert(`Resent verification code to ${targetEmail}`);
    }
  };

  return (
    <div className="onboarding-modal">
      <OnboardingIllustration
        imageSrc={
          (authMode === 'signup' && step === 3) || (authMode === 'login' && loginStep === 2)
            ? '/OTPbg.png'
            : '/Welcome.png'
        }
      />

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
            />
          )}
        </>
      )}

      {/* LOGIN FLOW (NO ROLE SELECTION!) */}
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
            />
          )}
        </>
      )}
    </div>
  );
};
