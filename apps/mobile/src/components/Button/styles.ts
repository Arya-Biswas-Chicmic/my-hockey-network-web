import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';
import { _scaleText } from '@utils/utility';

const styles = (Colors: ThemeColors) =>
  StyleSheet.create({
    button: {
      width: '100%',
      backgroundColor: Colors.primary,
      borderRadius: 12,
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 14,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      color: Colors.onPrimary,
      fontSize: _scaleText(15),
    },
  });

export default styles;
