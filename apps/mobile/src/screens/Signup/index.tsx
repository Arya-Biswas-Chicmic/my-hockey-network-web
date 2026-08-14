import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppDispatch } from '@redux/store';
import { loginUser } from '@redux/CommonReducer';
import { BRAND_COLORS, CREATE_ACCOUNT_STRINGS } from '@my-hockey-network/shared';
import { ROUTES } from '../../navigation/constants';
import { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, ROUTES.SIGNUP>;

const SignupScreen = ({ navigation }: Props) => {
  const dispatch = useAppDispatch();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dob, setDob] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = () => {
    dispatch(loginUser({ token: 'user_auth_token' }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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
              source={require('../../../assets/images/Welcome.png')}
              style={styles.illustrationImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.titleText}>{CREATE_ACCOUNT_STRINGS.title}</Text>
            <Text style={styles.subtitleText}>{CREATE_ACCOUNT_STRINGS.subtitle}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{CREATE_ACCOUNT_STRINGS.fullNameLabel}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={CREATE_ACCOUNT_STRINGS.fullNamePlaceholder}
                placeholderTextColor="#BFBFBF"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{CREATE_ACCOUNT_STRINGS.emailLabel}</Text>
              <TextInput
                style={styles.textInput}
                placeholder={CREATE_ACCOUNT_STRINGS.emailPlaceholder}
                placeholderTextColor="#BFBFBF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>{CREATE_ACCOUNT_STRINGS.dobLabel}</Text>
              <View style={styles.inputWithIconWrapper}>
                <TextInput
                  style={styles.textInputWithIcon}
                  placeholder={CREATE_ACCOUNT_STRINGS.dobPlaceholder}
                  placeholderTextColor="#BFBFBF"
                  value={dob}
                  onChangeText={setDob}
                />
                <Image
                  source={require('../../../assets/images/calendar.png')}
                  style={styles.inputIconImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <Pressable style={styles.signUpButton} onPress={handleSignUp}>
              <Text style={styles.signUpButtonText}>
                {CREATE_ACCOUNT_STRINGS.submitButton}
              </Text>
            </Pressable>

            <Pressable style={styles.googleButton} onPress={handleSignUp}>
              <Image
                source={require('../../../assets/images/social.png')}
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
    </SafeAreaView>
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
