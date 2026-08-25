import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';

import { FONT } from '@utils/constants';

const styles = (Colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      backgroundColor: Colors.background,
    },
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: Colors.text,
      fontFamily: FONT.MEDIUM,
    },
  });

export default styles;
