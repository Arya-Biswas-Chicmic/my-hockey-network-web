import { View } from 'react-native';

import Home from '@screens/Home';
import Profile from '@screens/Profile';

import useStyles from '@hooks/useStyles';
import { FONT } from '@utils/constants';
import { ICONS } from '@utils/icons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import styles from './styles';

import { TAB_ROUTES } from './tabRoutes';

export type MainTabParamList = {
  [TAB_ROUTES.HOME]: undefined;
  [TAB_ROUTES.PROFILE]: undefined;
};

type TabConfig = {
  name: keyof MainTabParamList;
  label: string;
  component: React.ComponentType<any>;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const TABS: TabConfig[] = [
  { name: TAB_ROUTES.HOME, label: 'Home', component: Home },
  { name: TAB_ROUTES.PROFILE, label: 'Profile', component: Profile },
];

const MainTabs = () => {
  const { dynamicStyles, Colors } = useStyles(styles);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: dynamicStyles.tabBar,
        tabBarActiveTintColor: Colors.primary as string,
        tabBarInactiveTintColor: Colors.mutedText as string,
        tabBarLabelStyle: [dynamicStyles.tabLabel, { fontFamily: FONT.MEDIUM }],
      }}
      initialRouteName={TAB_ROUTES.HOME}
    >
      {TABS.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            tabBarLabel: tab.label,
            tabBarIcon: ({ color }) => (
              <View style={dynamicStyles.iconWrap}>
                <ICONS.User width={22} height={22} color={color} />
              </View>
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default MainTabs;
