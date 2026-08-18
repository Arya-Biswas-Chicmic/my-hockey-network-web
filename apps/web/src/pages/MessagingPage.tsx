import React, { useState } from 'react';
import { Header } from '../components/common/Header';
import { PendingBanner } from '../components/common/PendingBanner';
import { ChatSidebar } from '../components/features/messaging/ChatSidebar';
import { ChatConversation } from '../components/features/messaging/ChatConversation';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

export const MessagingPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const [activeNavTab, setActiveNavTab] = useState('messaging');
  const [selectedChatId, setSelectedChatId] = useState('c1');

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
      <PendingBanner
        message="Guardian invitation pending. Your guardian has not yet accepted your request to connect."
        actionText="Manage Invitations"
        onActionClick={() => alert('Manage invitations clicked')}
      />

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
          <ChatConversation
            title="Hockey Club"
            subtitle="187 People • 4 Online"
            avatarUrl="/HockeyClub2.png"
          />
        </section>
      </main>
    </div>
  );
};
