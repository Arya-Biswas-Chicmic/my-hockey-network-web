import React, { useState } from 'react';
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
  EventDetailPage
} from './pages';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<string>('home');

  const handleNavigate = (screen: string) => {
    setCurrentScreen(screen);
  };

  const handleLogout = () => {
    setCurrentScreen('onboarding');
  };

  return (
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
      {currentScreen === 'event-detail' && (
        <EventDetailPage 
          onNavigate={handleNavigate} 
          onLogout={handleLogout}
          onBack={() => setCurrentScreen('profile')}
        />
      )}

      {/* Onboarding Flow Screens */}
      {currentScreen === 'onboarding' && (
        <OnboardingPage onComplete={() => setCurrentScreen('guardian')} />
      )}
      {currentScreen === 'guardian' && (
        <GuardianApprovalPage 
          onSendSuccess={() => setCurrentScreen('sent')}
          onSignOut={handleLogout}
        />
      )}
      {currentScreen === 'sent' && (
        <RequestSentPage onComplete={() => setCurrentScreen('home')} />
      )}
    </div>
  );
}

