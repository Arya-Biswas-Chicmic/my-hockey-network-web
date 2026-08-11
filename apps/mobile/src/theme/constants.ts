import { DarkColorType } from './darkTheme';
import { DefaultColorType } from './lightTheme';

export enum THEME {
  DEVICE = 'Device',
  LIGHT = 'Light',
  DARK = 'Dark',
}

export interface ThemeColors extends DefaultColorType, DarkColorType {
  [key: string]: string | number | object | [];
}
