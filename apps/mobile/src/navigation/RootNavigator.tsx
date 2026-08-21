import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppDispatch, useAppSelector } from '@redux/store';
import {
  completeAuthBootstrap,
  loginUser,
  logoutUser,
} from '@redux/CommonReducer';
import { mobileAuth } from '../platform/auth-service';
import { mobileAuthStorage } from '../platform/auth-storage';
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
  const dispatch = useAppDispatch();
  const navigationRef = useNavigationContainerRef();
  useReactNavigationDevTools(navigationRef);

  const { isAuthenticated, hasBootstrapped } = useAppSelector(
    state => state.common,
  );

  useEffect(() => {
    let active = true;
    void Promise.resolve(mobileAuthStorage.getAccessToken()).then(
      async token => {
        if (!active) return;
        if (!token) {
          dispatch(completeAuthBootstrap());
          return;
        }
        try {
          const user = await mobileAuth.getMe();
          if (active) dispatch(loginUser({ user }));
        } catch {
          await mobileAuthStorage.clearSession();
          if (active) dispatch(logoutUser());
        }
      },
    );
    return () => {
      active = false;
    };
  }, [dispatch]);

  if (!hasBootstrapped) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }
  return (
    <SafeAreaProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <Stack.Group>
              <Stack.Screen name={ROUTES.MAIN_TABS} component={MainTabs} />
            </Stack.Group>
          ) : (
            <Stack.Group>
              <Stack.Screen
                name={ROUTES.ONBOARDING}
                component={OnboardingScreen}
              />
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
