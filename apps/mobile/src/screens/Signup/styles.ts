import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';
import { _scaleText } from '@utils/utility';

const styles = (Colors: ThemeColors) =>
  StyleSheet.create({
    screen: {
      backgroundColor: Colors.background,
      padding: 16,
      justifyContent: 'center',
    },
    card: {
      backgroundColor: Colors.background,
    },
    title: {
      color: Colors.text,
      fontSize: _scaleText(26),
    },
    subtitle: {
      color: Colors.mutedText,
      marginTop: 6,
      fontSize: _scaleText(14),
    },
    form: {
      marginTop: 18,
      gap: 14,
    },
    submitError: {
      fontSize: _scaleText(13),
    },
    bottomLink: {
      marginTop: 4,
      alignItems: 'center',
    },
    link: {
      color: Colors.primary,
      fontSize: _scaleText(13),
    },
  });

export default styles;
