import { DarkColorType } from '@/theme/darkTheme';
import { DefaultColorType } from '@/theme/lightTheme';

export enum THEME {
  DEVICE = 'Device',
  LIGHT = 'Light',
  DARK = 'Dark',
}

export interface ThemeColors extends DefaultColorType, DarkColorType {
  [key: string]: string | number | object | [];
}
