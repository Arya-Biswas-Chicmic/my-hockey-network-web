import { useAppSelector } from '@redux/store';
import OnboardingScreen from '@screens/Onboarding';
import ForgotPasswordScreen from '@screens/ForgotPassword';
import LoginScreen from '@screens/Login';
import SignupScreen from '@screens/Signup';

import { ROUTES } from './constants';
import MainTabs from './MainTabs';
import { RootStackParamList } from './types';

import {
  NavigationContainer,
  useNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useReactNavigationDevTools } from '@dev-plugins/react-navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const RootNavigator = () => {
  const navigationRef = useNavigationContainerRef();
  useReactNavigationDevTools(navigationRef);

  const userToken = useAppSelector(state => state.common.userToken);
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {userToken ? (
            <Stack.Group>
              <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabs} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen name={ROUTES.ONBOARDING} component={OnboardingScreen} />
              <Stack.Screen name={ROUTES.LOGIN} component={LoginScreen} />
              <Stack.Screen name={ROUTES.SIGNUP} component={SignupScreen} />
              <Stack.Screen
                name={ROUTES.FORGOT_PASSWORD}
                component={ForgotPasswordScreen}
              />
            </Stack.Group>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};
export default RootNavigator;
