import {
  GenderCategoryEnum,
  HockeyPositionEnum,
  ProfileVisibilityEnum,
  ShootsCatchesEnum,
} from '@my-hockey-network/contracts';

export const POSITION_OPTIONS = [
  { value: HockeyPositionEnum.CENTER, label: 'Center (C)' },
  { value: HockeyPositionEnum.LEFT_WING, label: 'Left Wing (LW)' },
  { value: HockeyPositionEnum.RIGHT_WING, label: 'Right Wing (RW)' },
  { value: HockeyPositionEnum.DEFENSE, label: 'Defense (D)' },
  { value: HockeyPositionEnum.GOALTENDER, label: 'Goaltender (G)' },
] as const;

export const SHOOTS_OPTIONS = Object.values(ShootsCatchesEnum).map((value) => ({ value, label: value }));
export const GENDER_OPTIONS = Object.values(GenderCategoryEnum).map((value) => ({ value, label: value }));
export const VISIBILITY_OPTIONS = [
  { value: ProfileVisibilityEnum.EVERYONE, label: 'Everyone (Public)' },
  { value: ProfileVisibilityEnum.CONNECTIONS, label: 'Connections Only' },
  { value: ProfileVisibilityEnum.PRIVATE, label: 'Private (Only Me)' },
] as const;
export const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'nl', label: 'Dutch (Nederlands)' },
  { value: 'sv', label: 'Swedish (Svenska)' },
] as const;

export const HEIGHT_OPTIONS = Array.from({ length: 37 }, (_, i) => {
  const inches = i + 48; // 48 inches = 4 feet
  const feet = Math.floor(inches / 12);
  const remainingInches = inches % 12;
  const value = `${feet}' ${remainingInches}"`;
  const label = `${feet}'${remainingInches}"`;
  return { value, label };
});

