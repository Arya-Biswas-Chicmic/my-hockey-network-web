import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';
import { _scaleText } from '@utils/utility';

import { HEADER_HEIGHT } from './constants';

const styles = (Colors: ThemeColors) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      elevation: 20,
      backgroundColor: Colors.background,
      borderBottomWidth: 1,
      borderBottomColor: Colors.border,
    },
    content: {
      height: HEADER_HEIGHT,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
    },
    side: {
      width: 96,
      justifyContent: 'center',
    },
    sideRight: {
      alignItems: 'flex-end',
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      color: Colors.text,
      fontSize: _scaleText(16),
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 6,
      paddingHorizontal: 6,
    },
    backText: {
      color: Colors.primary,
      fontSize: _scaleText(22),
      marginRight: 6,
      marginTop: -1,
    },
    backLabel: {
      color: Colors.primary,
      fontSize: _scaleText(14),
    },
  });

export default styles;
