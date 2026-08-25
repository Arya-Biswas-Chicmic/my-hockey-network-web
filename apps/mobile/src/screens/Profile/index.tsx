import { Text, View } from 'react-native';

import ScreenWrapper from '@components/ScreenWrapper';
import useStyles from '@hooks/useStyles';

import styles from './styles';

const Profile = () => {
  const { dynamicStyles } = useStyles(styles);

  return (
    <ScreenWrapper
      style={dynamicStyles.screen}
      headerProps={{ title: 'Profile' }}
    >
      <View style={dynamicStyles.centerContainer}>
        <Text style={dynamicStyles.text}>Profile</Text>
      </View>
    </ScreenWrapper>
  );
};

export default Profile;
