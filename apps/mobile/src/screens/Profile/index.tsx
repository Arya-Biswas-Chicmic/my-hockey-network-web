import { Text, View } from 'react-native';

import ScreenWrapper from '@components/ScreenWrapper';
import useStyles from '@hooks/useStyles';
import { FONT } from '@utils/constants';

import styles from './styles';

const Profile = () => {
  const { dynamicStyles, Layout } = useStyles(styles);

  return (
    <ScreenWrapper
      style={dynamicStyles.screen}
      headerProps={{ title: 'Profile' }}
    >
      <View style={[Layout.flex, Layout.center]}>
        <Text style={[dynamicStyles.text, { fontFamily: FONT.MEDIUM }]}>
          Profile
        </Text>
      </View>
    </ScreenWrapper>
  );
};

export default Profile;
