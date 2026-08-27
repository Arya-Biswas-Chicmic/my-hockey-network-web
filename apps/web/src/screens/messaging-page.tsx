import React, { useState } from 'react';
import { Header } from '@/components/common/Header';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { ChatSidebar } from '@/components/features/messaging/ChatSidebar';
import { ChatConversation } from '@/components/features/messaging/ChatConversation';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const MessagingPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeNavTab, setActiveNavTab] = useState('messaging');
  const [selectedChatId, setSelectedChatId] = useState<string>();

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  return (
    <div className="mhn-messaging-page-root">
      {/* Top Header Navigation Bar */}
      <Header
        activeTab={activeNavTab}
        onTabChange={handleTabChange}
        onLogout={onLogout}
      />

      {/* Pending Guardian Notice Banner */}
      {!permissions.allowed && permissions.message && (
        <PendingBanner
          message={permissions.message}
          actionText={permissions.ctaText || 'Complete Profile'}
          onActionClick={() => {
            if (permissions.ctaAction === 'COMPLETE_PROFILE') {
              if (onNavigate) onNavigate('profile');
            } else if (permissions.ctaAction === 'GUARDIAN_APPROVAL') {
              if (onNavigate) onNavigate('supervision');
            } else if (permissions.ctaAction === 'LOGIN') {
              if (onNavigate) onNavigate('login');
            }
          }}
        />
      )}

      {/* Main 2-Column Content Layout */}
      <main className="mhn-messaging-main-container">
        {/* Left Column: Chats List Sidebar */}
        <aside className="mhn-messaging-sidebar-col">
          <ChatSidebar
            selectedChatId={selectedChatId}
            onSelectChat={(id) => setSelectedChatId(id)}
          />
        </aside>

        {/* Right Column: Chat Conversation Window */}
        <section className="mhn-messaging-conversation-col">
          <ChatConversation />
        </section>
      </main>
    </div>
  );
};
