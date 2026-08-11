import { StyleSheet } from 'react-native';

import { ThemeColors } from '@theme/constants';
import { _scaleText } from '@utils/utility';

const styles = (Colors: ThemeColors) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: Colors.background,
      borderTopColor: Colors.border,
      borderTopWidth: 1,
      height: 60,
      paddingBottom: 8,
      paddingTop: 6,
    },
    tabLabel: {
      fontSize: _scaleText(11),
    },
    iconWrap: {
      marginTop: 2,
    },
  });

export default styles;
