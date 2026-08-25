import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';

import { FONT } from '@utils/constants';

const styles = (Colors: ThemeColors) =>
  StyleSheet.create({
    centerContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      height: '100%',
    },
    button: {
      color: Colors.white,
      fontFamily: FONT.BOLD,
    },
    image: {
      height: 100,
      width: 100,
    },
  });

export default styles;
