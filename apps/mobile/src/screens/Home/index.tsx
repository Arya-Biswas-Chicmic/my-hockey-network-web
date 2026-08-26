import { Image, Pressable, Text, View } from 'react-native';

import styles from '@/screens/Home/styles';

import useImages from '@hooks/useImages';
import useStyles from '@hooks/useStyles';
import ScreenWrapper from '@components/ScreenWrapper';
import { logoutUser } from '@redux/CommonReducer';
import { useAppDispatch } from '@redux/store';
import { ICONS } from '@utils/icons';
import { STRINGS } from '@utils/strings';

import { useTranslation } from 'react-i18next';

const Home = () => {
  const { i18n } = useTranslation();
  const dispatch = useAppDispatch();
  const logout = () => {
    dispatch(logoutUser());
  };
  const { dynamicStyles, toggleTheme } = useStyles(styles);
  const IMAGES = useImages();
  return (
    <ScreenWrapper headerProps={{ title: 'Home', showBack: false }}>
      <View style={dynamicStyles.centerContainer}>
        <Text style={dynamicStyles.button}>{STRINGS.HI}</Text>
        <Image source={IMAGES.MONEY} style={dynamicStyles.image} />
        <ICONS.User width={500} height={50} color="red" />
        <Pressable
          onPress={() => {
            i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
          }}
        >
          <Text>Translate</Text>
        </Pressable>
        <Pressable onPress={toggleTheme}>
          <Text>Change Theme</Text>
        </Pressable>
        <Pressable onPress={logout}>
          <Text>Logout</Text>
        </Pressable>
      </View>
    </ScreenWrapper>
  );
};
export default Home;
