import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';

const styles = (Colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      color: Colors.white,
    },
  });

export default styles;
