import { useMemo, useState } from 'react';

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native';

import Button from '@components/Button';
import Input from '@components/Input';
import ScreenWrapper from '@components/ScreenWrapper';
import useStyles from '@hooks/useStyles';
import { ROUTES } from '../../navigation/constants';
import { RootStackParamList } from '../../navigation/types';
import { loginUser } from '@redux/CommonReducer';
import { useAppDispatch } from '@redux/store';
import { FONT } from '@utils/constants';
import { isValidEmail, sanitizeEmail } from '@utils/validation';
import { mobileAuth } from '../../platform/auth-service';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';

type Props = NativeStackScreenProps<RootStackParamList, ROUTES.LOGIN>;

const LoginScreen = ({ navigation }: Props) => {
  const { dynamicStyles, Layout, Colors } = useStyles(styles);
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<{
    email?: boolean;
    otp?: boolean;
  }>({});

  const emailError = useMemo(() => {
    if (!touched.email) return undefined;
    const e = sanitizeEmail(email);
    if (!e) return 'Email is required.';
    if (!isValidEmail(e)) return 'Enter a valid email.';
    return undefined;
  }, [email, touched.email]);

  const canSubmit = useMemo(() => {
    const e = sanitizeEmail(email);
    return (
      !!e && isValidEmail(e) && (!otpRequested || /^\d{4,8}$/.test(otp.trim()))
    );
  }, [email, otp, otpRequested]);

  const onSubmit = async () => {
    Keyboard.dismiss();
    setSubmitError(undefined);
    setTouched({ email: true, otp: otpRequested });
    if (!canSubmit || isLoading) return;

    const e = sanitizeEmail(email);
    setIsLoading(true);
    try {
      if (!otpRequested) {
        await mobileAuth.requestOtp({
          channel: 'EMAIL',
          destination: e,
          intent: 'SIGNIN',
        });
        setOtpRequested(true);
        return;
      }
      await mobileAuth.verifyOtp({
        channel: 'EMAIL',
        destination: e,
        code: otp.trim(),
        intent: 'SIGNIN',
      });
      const user = await mobileAuth.getMe();
      dispatch(loginUser({ user }));
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        'Unable to login. Please try again.';
      setSubmitError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper
      style={dynamicStyles.screen}
      headerProps={{ title: 'Login', showBack: false }}
    >
      <Pressable
        style={Layout.flex}
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <KeyboardAvoidingView
          style={Layout.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={dynamicStyles.card}>
            <Text style={[dynamicStyles.title, { fontFamily: FONT.BOLD }]}>
              Welcome back
            </Text>
            <Text
              style={[dynamicStyles.subtitle, { fontFamily: FONT.REGULAR }]}
            >
              Sign in to continue
            </Text>

            <View style={dynamicStyles.form}>
              <Input
                accessibilityLabel="Email"
                label="Email"
                value={email}
                onChangeText={text => {
                  setEmail(text);
                  setSubmitError(undefined);
                }}
                onBlur={() => setTouched(t => ({ ...t, email: true }))}
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoComplete="email"
                returnKeyType="next"
                error={emailError}
                placeholder="you@example.com"
              />

              {otpRequested && (
                <Input
                  accessibilityLabel="Verification code"
                  label="Verification code"
                  value={otp}
                  onChangeText={text => {
                    setOtp(text);
                    setSubmitError(undefined);
                  }}
                  onBlur={() => setTouched(t => ({ ...t, otp: true }))}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  autoComplete="sms-otp"
                  returnKeyType="done"
                  error={
                    touched.otp && !/^\d{4,8}$/.test(otp.trim())
                      ? 'Enter a valid verification code.'
                      : undefined
                  }
                  placeholder="Code sent to your email"
                />
              )}

              {!!submitError && (
                <Text
                  accessibilityRole="alert"
                  style={[dynamicStyles.submitError, { color: Colors.error }]}
                >
                  {submitError}
                </Text>
              )}

              <Button
                title={
                  otpRequested ? 'Verify & sign in' : 'Send verification code'
                }
                onPress={onSubmit}
                loading={isLoading}
                disabled={!canSubmit}
                accessibilityLabel="Login"
              />

              <View style={dynamicStyles.linksRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Forgot password"
                  onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                  disabled={isLoading}
                >
                  <Text
                    style={[dynamicStyles.link, { fontFamily: FONT.MEDIUM }]}
                  >
                    Forgot password?
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Go to signup"
                  onPress={() => navigation.navigate(ROUTES.SIGNUP)}
                  disabled={isLoading}
                >
                  <Text
                    style={[dynamicStyles.link, { fontFamily: FONT.MEDIUM }]}
                  >
                    Create account
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Pressable>
    </ScreenWrapper>
  );
};

export default LoginScreen;
