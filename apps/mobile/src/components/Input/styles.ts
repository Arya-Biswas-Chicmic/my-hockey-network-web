import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';
import { _scaleText } from '@utils/utility';

import { FONT } from '@utils/constants';

const styles = (Colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      width: '100%',
    },
    label: {
      color: Colors.text,
      marginBottom: 6,
      fontSize: _scaleText(13),
      fontFamily: FONT.MEDIUM,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Colors.border,
      backgroundColor: Colors.surface,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    inputContainerFocused: {
      borderColor: Colors.primary,
    },
    inputContainerError: {
      borderColor: Colors.error,
    },
    inputContainerDisabled: {
      opacity: 0.6,
    },
    input: {
      flex: 1,
      color: Colors.text,
      fontSize: _scaleText(15),
      padding: 0,
      fontFamily: FONT.REGULAR,
    },
    errorText: {
      marginTop: 6,
      color: Colors.error,
      fontSize: _scaleText(12),
      fontFamily: FONT.REGULAR,
    },
  });

export default styles;
