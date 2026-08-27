import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';

import { preloadFonts } from '@utils/constants';
import { preloadImages } from '@utils/images';
import RootNavigator from './src/navigation/RootNavigator';
import store, { persistor } from './src/redux/store';
import './src/localization';
import { configureMobilePlatform } from './src/platform/api-client';
import { globalQueryClient } from './src/platform/query-client';

configureMobilePlatform();

SplashScreen.preventAutoHideAsync();

function AppContent() {
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        await Promise.all([preloadImages(), preloadFonts()]);
      } catch (error) {
        console.warn('Error preloading fonts/images:', error);
      } finally {
        if (isMounted) {
          await SplashScreen.hideAsync();
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  return <RootNavigator />;
}

export default function App() {
  return (
    <QueryClientProvider client={globalQueryClient}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}
