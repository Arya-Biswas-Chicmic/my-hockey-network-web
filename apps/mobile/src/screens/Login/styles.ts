import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';
import { _scaleText } from '@utils/utility';

import { FONT } from '@utils/constants';

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
      fontFamily: FONT.BOLD,
    },
    subtitle: {
      color: Colors.mutedText,
      marginTop: 6,
      fontSize: _scaleText(14),
      fontFamily: FONT.REGULAR,
    },
    form: {
      marginTop: 18,
      gap: 14,
    },
    submitError: {
      fontSize: _scaleText(13),
      color: Colors.error,
    },
    linksRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 6,
    },
    link: {
      color: Colors.primary,
      fontSize: _scaleText(13),
      fontFamily: FONT.MEDIUM,
    },
  });

export default styles;
