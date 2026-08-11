import User from '@assets/svg/user.svg';

import { RFValue } from 'react-native-responsive-fontsize';
const iconStyle = ({
  width = 0,
  height = 0,
  color = 'black',
  borderColor = 'none',
}) => ({
  width: RFValue(width),
  height: RFValue(height),
  fill: color,
  stroke: borderColor,
});
export type iconProps = {
  width: number;
  height: number;
  color?: string;
  borderColor?: string;
};

export const ICONS = {
  User: (params: iconProps) => User({ ...iconStyle({ ...params }) }),
};
