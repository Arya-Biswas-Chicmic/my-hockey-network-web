import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';

const styles = (Colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      backgroundColor: Colors.background,
    },
    text: {
      color: Colors.text,
    },
  });

export default styles;
