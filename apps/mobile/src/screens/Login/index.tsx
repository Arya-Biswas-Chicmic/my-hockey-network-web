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
import { useLoginMutation } from '@redux/ApiReducer';
import { useAppDispatch } from '@redux/store';
import { FONT } from '@utils/constants';
import {
  isValidEmail,
  sanitizeEmail,
  sanitizePassword,
  validatePassword,
} from '@utils/validation';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import styles from './styles';

type Props = NativeStackScreenProps<RootStackParamList, ROUTES.LOGIN>;

const LoginScreen = ({ navigation }: Props) => {
  const { dynamicStyles, Layout, Colors } = useStyles(styles);
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitError, setSubmitError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState<{
    email?: boolean;
    password?: boolean;
  }>({});

  const emailError = useMemo(() => {
    if (!touched.email) return undefined;
    const e = sanitizeEmail(email);
    if (!e) return 'Email is required.';
    if (!isValidEmail(e)) return 'Enter a valid email.';
    return undefined;
  }, [email, touched.email]);

  const passwordError = useMemo(() => {
    if (!touched.password) return undefined;
    const p = sanitizePassword(password);
    if (!p) return 'Password is required.';
    return validatePassword(p);
  }, [password, touched.password]);

  const canSubmit = useMemo(() => {
    const e = sanitizeEmail(email);
    const p = sanitizePassword(password);
    return !!e && isValidEmail(e) && !!p && !validatePassword(p);
  }, [email, password]);

  const onSubmit = async () => {
    Keyboard.dismiss();
    setSubmitError(undefined);
    setTouched({ email: true, password: true });
    if (!canSubmit || isLoading) return;

    const e = sanitizeEmail(email);
    const p = sanitizePassword(password);

    try {
      const res = await login({ email: e, password: p }).unwrap();
      dispatch(loginUser({ token: res.token, user: res.user }));
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        'Unable to login. Please try again.';
      setSubmitError(message);
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

              <Input
                accessibilityLabel="Password"
                label="Password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  setSubmitError(undefined);
                }}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                returnKeyType="done"
                error={passwordError}
                placeholder="Your password"
              />

              {!!submitError && (
                <Text
                  accessibilityRole="alert"
                  style={[dynamicStyles.submitError, { color: Colors.error }]}
                >
                  {submitError}
                </Text>
              )}

              <Button
                title="Login"
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
