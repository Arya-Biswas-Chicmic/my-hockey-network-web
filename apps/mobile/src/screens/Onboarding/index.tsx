import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ImageSourcePropType,
} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BRAND_COLORS, ONBOARDING_STRINGS } from '@my-hockey-network/shared';
import { ROUTES } from '@/navigation/constants';
import { RootStackParamList } from '@/navigation/types';

interface MobileRoleOption {
  id: string;
  title: string;
  description: string;
  icon: ImageSourcePropType;
}

const ROLE_OPTIONS: MobileRoleOption[] = [
  {
    id: 'parent',
    title: 'Parent / Guardian',
    description: 'Support my athlete on and off the ice',
    icon: require('../../../assets/images/parents.webp'),
  },
  {
    id: 'player',
    title: 'Player',
    description: 'I play hockey',
    icon: require('../../../assets/images/player.webp'),
  },
  {
    id: 'coach',
    title: 'Coach / Team Staff',
    description: 'I coach or support a team.',
    icon: require('../../../assets/images/CoachTeam.webp'),
  },
];

type Props = NativeStackScreenProps<RootStackParamList, ROUTES.ONBOARDING>;

const OnboardingScreen = ({ navigation }: Props) => {
  const [selectedRoles, setSelectedRoles] = useState<string[]>(['player']);

  const toggleRole = (id: string) => {
    setSelectedRoles(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id],
    );
  };

  const handleContinue = () => {
    navigation.navigate(ROUTES.SIGNUP);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
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

        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{ONBOARDING_STRINGS.title}</Text>
          <Text style={styles.subtitleText}>{ONBOARDING_STRINGS.subtitle}</Text>

          <View style={styles.optionsList}>
            {ROLE_OPTIONS.map(role => {
              const isSelected = selectedRoles.includes(role.id);
              return (
                <Pressable
                  key={role.id}
                  onPress={() => toggleRole(role.id)}
                  style={[
                    styles.roleCard,
                    isSelected && styles.roleCardSelected,
                  ]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                >
                  <View style={styles.roleLeftGroup}>
                    <View style={styles.iconBox}>
                      <Image
                        source={role.icon}
                        style={styles.iconImage}
                        resizeMode="contain"
                      />
                    </View>

                    <View style={styles.roleTextContainer}>
                      <Text style={styles.roleTitle}>{role.title}</Text>
                      <Text style={styles.roleDescription}>
                        {role.description}
                      </Text>
                    </View>
                  </View>

                  <Image
                    source={
                      isSelected
                        ? require('../../../assets/images/checked.webp')
                        : require('../../../assets/images/unchecked.webp')
                    }
                    style={styles.checkboxImage}
                    resizeMode="contain"
                  />
                </Pressable>
              );
            })}
          </View>

          <Pressable
            onPress={handleContinue}
            style={({ pressed }) => [
              styles.continueButton,
              pressed && styles.continueButtonPressed,
            ]}
          >
            <Text style={styles.continueButtonText}>
              {ONBOARDING_STRINGS.continueButton}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BRAND_COLORS.bgScreen,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  illustrationContainer: {
    width: '100%',
    height: 240,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: BRAND_COLORS.bgIllustration,
    marginBottom: 24,
  },
  illustrationImage: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    width: '100%',
    maxWidth: 440,
  },
  titleText: {
    fontSize: RFValue(28),
    fontWeight: '700',
    color: BRAND_COLORS.heading,
    textAlign: 'center',
    lineHeight: RFValue(34),
    letterSpacing: -0.5,
  },
  subtitleText: {
    fontSize: RFValue(14),
    fontWeight: '400',
    color: BRAND_COLORS.subheading,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 24,
    lineHeight: RFValue(20),
  },
  optionsList: {
    gap: 12,
    marginBottom: 28,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 4,
    backgroundColor: BRAND_COLORS.bgCard,
    borderWidth: 1,
    borderColor: BRAND_COLORS.borderLight,
  },
  roleCardSelected: {
    borderWidth: 2,
    borderColor: BRAND_COLORS.borderSelected,
  },
  roleLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
    marginRight: 10,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F0F6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 50,
    height: 48,
  },
  roleTextContainer: {
    flex: 1,
  },
  roleTitle: {
    fontSize: RFValue(15),
    fontWeight: '600',
    color: BRAND_COLORS.textDark,
    lineHeight: RFValue(21),
  },
  roleDescription: {
    fontSize: RFValue(13),
    fontWeight: '400',
    color: BRAND_COLORS.textMuted,
    marginTop: 2,
    lineHeight: RFValue(18),
  },
  checkboxImage: {
    width: 18,
    height: 18,
  },
  continueButton: {
    width: '100%',
    height: 57,
    backgroundColor: BRAND_COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: BRAND_COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonPressed: {
    backgroundColor: BRAND_COLORS.primaryHover,
  },
  continueButtonText: {
    fontSize: RFValue(16),
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OnboardingScreen;
