import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { getAuthSession, getUserProfile } from '@my-hockey-network/core';
import { 
  GuardianApprovalPage, 
  RequestSentPage, 
  OnboardingPage, 
  HomePage, 
  MyNetworkPage, 
  EventsPage, 
  MessagingPage, 
  NotificationsPage, 
  ProfilePage,
  EventDetailPage,
  SettingsPage,
  SupervisionPage
} from './pages';

function getScreenFromPath(path: string): string {
  const cleanPath = path.replace(/^\//, '').trim().toLowerCase();
  if (!cleanPath || cleanPath === 'home') return 'home';
  const knownScreens = [
    'home',
    'network',
    'events',
    'messaging',
    'notifications',
    'profile',
    'settings',
    'supervision',
    'event-detail',
    'onboarding',
    'guardian',
    'sent'
  ];
  return knownScreens.includes(cleanPath) ? cleanPath : 'home';
}

function hasActiveToken(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session = getAuthSession();
    const profile = getUserProfile();
    const token = localStorage.getItem('mhn_access_token') || localStorage.getItem('accessToken');
    return !!(session || profile || token);
  } catch {
    return false;
  }
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>(() => {
    if (!hasActiveToken()) {
      return 'onboarding';
    }
    return getScreenFromPath(window.location.pathname);
  });

  useEffect(() => {
    // Keep URL in sync with initial load screen
    if (hasActiveToken()) {
      const initialScreen = getScreenFromPath(window.location.pathname);
      const urlPath = initialScreen === 'home' ? '/' : `/${initialScreen}`;
      if (window.location.pathname !== urlPath) {
        window.history.replaceState({}, '', urlPath);
      }
    } else {
      if (window.location.pathname !== '/onboarding' && window.location.pathname !== '/') {
        window.history.replaceState({}, '', '/onboarding');
      }
    }

    // Sync browser back/forward history navigation
    const handlePopState = () => {
      if (!hasActiveToken()) {
        setCurrentScreen('onboarding');
        return;
      }
      const targetScreen = getScreenFromPath(window.location.pathname);
      setCurrentScreen(targetScreen);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleNavigate = (screen: string) => {
    if (!hasActiveToken() && screen !== 'onboarding' && screen !== 'guardian' && screen !== 'sent') {
      setCurrentScreen('onboarding');
      window.history.pushState({}, '', '/onboarding');
      return;
    }

    setCurrentScreen(screen);
    const urlPath = screen === 'home' ? '/' : `/${screen}`;
    if (window.location.pathname !== urlPath) {
      window.history.pushState({}, '', urlPath);
    }
  };

  const handleLogout = () => {
    setCurrentScreen('onboarding');
    if (window.location.pathname !== '/onboarding') {
      window.history.pushState({}, '', '/onboarding');
    }
  };

  const handleOnboardingComplete = (data?: any) => {
    setCurrentScreen('home');
    window.history.pushState({}, '', '/');
  };

  return (
    <AuthProvider onNavigateToAuth={handleLogout}>
      <div className="app-viewport">
        {currentScreen === 'home' && (
          <HomePage onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        {currentScreen === 'network' && (
          <MyNetworkPage onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        {currentScreen === 'events' && (
          <EventsPage onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        {currentScreen === 'messaging' && (
          <MessagingPage onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        {currentScreen === 'notifications' && (
          <NotificationsPage onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        {currentScreen === 'profile' && (
          <ProfilePage onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        {currentScreen === 'settings' && (
          <SettingsPage onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        {currentScreen === 'supervision' && (
          <SupervisionPage onNavigate={handleNavigate} onLogout={handleLogout} />
        )}
        {currentScreen === 'event-detail' && (
          <EventDetailPage 
            onNavigate={handleNavigate} 
            onLogout={handleLogout}
            onBack={() => handleNavigate('profile')}
          />
        )}

        {/* Onboarding Flow Screens */}
        {currentScreen === 'onboarding' && (
          <OnboardingPage onComplete={handleOnboardingComplete} />
        )}
        {currentScreen === 'guardian' && (
          <GuardianApprovalPage 
            onSendSuccess={() => handleNavigate('sent')}
            onSignOut={handleLogout}
          />
        )}
        {currentScreen === 'sent' && (
          <RequestSentPage onComplete={() => handleNavigate('home')} />
        )}
      </div>
    </AuthProvider>
  );
}
