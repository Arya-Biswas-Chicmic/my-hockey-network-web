import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch } from '@redux/store';
import { loginUser } from '@redux/CommonReducer';
import {
  BRAND_COLORS,
  CREATE_ACCOUNT_STRINGS,
} from '@my-hockey-network/shared';
import { ROUTES } from '@/navigation/constants';
import { RootStackParamList } from '@/navigation/types';
import { mobileAuth } from '@/platform/auth-service';
import { emailSchema, otpSchema } from '@my-hockey-network/validation';
import Button from '@components/Button';
import Input from '@components/Input';
import ScreenWrapper from '@components/ScreenWrapper';

type Props = NativeStackScreenProps<RootStackParamList, ROUTES.SIGNUP>;

const SignupScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const emailResult = emailSchema.safeParse(normalizedEmail);
    if (!fullName.trim()) {
      setError('Full name is required.');
      return;
    }
    if (!emailResult.success) {
      setError(emailResult.error.issues[0]?.message ?? 'Enter a valid email.');
      return;
    }
    if (!dob.trim()) {
      setError('Date of birth is required.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      if (!otpRequested) {
        await mobileAuth.requestOtp({
          channel: 'EMAIL',
          destination: normalizedEmail,
          intent: 'SIGNUP',
        });
        setOtpRequested(true);
        return;
      }
      const otpResult = otpSchema.safeParse(otp);
      if (!otpResult.success) {
        setError(
          otpResult.error.issues[0]?.message ??
            'Enter a valid verification code.',
        );
        return;
      }
      await mobileAuth.verifyOtp({
        channel: 'EMAIL',
        destination: normalizedEmail,
        code: otp,
        intent: 'SIGNUP',
      });
      await mobileAuth.submitOnboarding({
        roles: ['PLAYER'],
        displayName: fullName.trim(),
        dateOfBirth: dob.trim(),
      });
      const user = await mobileAuth.getMe();
      dispatch(loginUser({ user }));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Unable to create account.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenWrapper showHeader={false} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.illustrationContainer}>
            <Image
              source={require('../../../assets/images/Welcome.webp')}
              style={styles.illustrationImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.titleText}>{CREATE_ACCOUNT_STRINGS.title}</Text>
            <Text style={styles.subtitleText}>
              {CREATE_ACCOUNT_STRINGS.subtitle}
            </Text>

            <Input
              containerStyle={styles.formGroup}
              label={CREATE_ACCOUNT_STRINGS.fullNameLabel}
              placeholder={CREATE_ACCOUNT_STRINGS.fullNamePlaceholder}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <Input
              containerStyle={styles.formGroup}
              label={CREATE_ACCOUNT_STRINGS.emailLabel}
              placeholder={CREATE_ACCOUNT_STRINGS.emailPlaceholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              containerStyle={styles.formGroup}
              label={CREATE_ACCOUNT_STRINGS.dobLabel}
              placeholder={CREATE_ACCOUNT_STRINGS.dobPlaceholder}
              value={dob}
              onChangeText={setDob}
              rightAccessory={
                <Image
                  source={require('../../../assets/images/calendar.webp')}
                  style={styles.inputIconImage}
                  resizeMode="contain"
                />
              }
            />

            {otpRequested && (
              <Input
                containerStyle={styles.formGroup}
                label="Verification code"
                placeholder="Enter the code sent to your email"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
            )}

            {error && <Text style={styles.errorText}>{error}</Text>}

            <Button
              style={styles.signUpButton}
              title={
                otpRequested
                  ? 'Verify & create account'
                  : CREATE_ACCOUNT_STRINGS.submitButton
              }
              onPress={handleSignUp}
              loading={isLoading}
              disabled={isLoading}
            />

            <Pressable
              style={styles.googleButton}
              onPress={() => setError('Google sign-in is not configured yet.')}
            >
              <Image
                source={require('../../../assets/images/social.webp')}
                style={styles.googleIconImage}
                resizeMode="contain"
              />
              <Text style={styles.googleButtonText}>
                {CREATE_ACCOUNT_STRINGS.googleButton}
              </Text>
            </Pressable>

            <Pressable
              style={styles.backButton}
              onPress={() => navigation.navigate(ROUTES.ONBOARDING)}
            >
              <Text style={styles.backButtonText}>
                {CREATE_ACCOUNT_STRINGS.backButton}
              </Text>
            </Pressable>

            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                {CREATE_ACCOUNT_STRINGS.alreadyHaveAccount}
              </Text>
              <Pressable onPress={() => navigation.navigate(ROUTES.ONBOARDING)}>
                <Text style={styles.signInLinkText}>
                  {CREATE_ACCOUNT_STRINGS.signInLink}
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.bgScreen,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: BRAND_COLORS.bgIllustration,
    marginBottom: 20,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  formContainer: {
    width: '100%',
    maxWidth: 440,
  },
  titleText: {
    fontSize: RFValue(26),
    fontWeight: '700',
    color: BRAND_COLORS.heading,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: RFValue(13),
    fontWeight: '400',
    color: BRAND_COLORS.subheading,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: RFValue(13),
    fontWeight: '500',
    color: BRAND_COLORS.heading,
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: RFValue(13),
    color: '#333333',
    backgroundColor: '#FFFFFF',
  },
  inputWithIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 8,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  textInputWithIcon: {
    flex: 1,
    fontSize: RFValue(13),
    color: '#333333',
    height: '100%',
  },
  inputIconImage: {
    width: 20,
    height: 20,
    tintColor: '#8C8C8C',
  },
  eyeToggleText: {
    fontSize: 16,
  },
  signUpButton: {
    height: 50,
    backgroundColor: '#1d61d1',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#1d61d1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  errorText: {
    color: '#DC2626',
    fontSize: RFValue(12),
    marginBottom: 8,
  },
  signUpButtonText: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  googleButton: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 12,
  },
  googleIconImage: {
    width: 20,
    height: 20,
  },
  googleButtonText: {
    fontSize: RFValue(14),
    fontWeight: '500',
    color: '#424242',
  },
  backButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: RFValue(13),
    color: '#8C8C8C',
    fontWeight: '500',
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  footerText: {
    fontSize: RFValue(13),
    color: '#8C8C8C',
  },
  signInLinkText: {
    fontSize: RFValue(13),
    fontWeight: '700',
    color: BRAND_COLORS.primary,
  },
});

export default SignupScreen;
