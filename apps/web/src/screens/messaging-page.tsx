import React, { useState } from 'react';
import { LeftSidebar } from '@/components/layout/LeftSidebar';
import { PendingBanner } from '@/components/common/PendingBanner';
import { useFeedPermissions } from '@/hooks/use-feed-permissions';
import { ChatSidebar, ChatItem } from '@/components/features/messaging/ChatSidebar';
import { ChatConversation, MessageItem } from '@/components/features/messaging/ChatConversation';

interface PageProps {
  onNavigate?: (screen: string) => void;
  onLogout?: () => void;
}

const DEFAULT_CHATS: ChatItem[] = [
  {
    id: 'hockey-club',
    name: 'Hockey Club',
    avatar: '/hockeyClub.webp',
    lastMessage: 'Gerard White: Etiam tempor orci...',
    unreadCount: 0,
    isGroup: true,
  },
  {
    id: 'steve',
    name: 'Steve',
    avatar: '/steve.webp',
    lastMessage: 'You: Yup',
    unreadCount: 0,
    isGroup: false,
  },
  {
    id: 'david',
    name: 'David',
    avatar: '/david.webp',
    lastMessage: 'Hey',
    unreadCount: 0,
    isGroup: false,
  },
];

const INITIAL_CONVERSATIONS: Record<
  string,
  {
    title: string;
    subtitle: string;
    avatarUrl: string;
    bannerUrl?: string;
    messages: MessageItem[];
  }
> = {
  'hockey-club': {
    title: 'Hockey Club',
    subtitle: '187 People · 4 Online',
    avatarUrl: '/hockeyClub.webp',
    bannerUrl: '/cover.webp',
    messages: [
      {
        id: 'msg-1',
        senderName: 'Mai Sakurajima',
        senderAvatar: '/mai.webp',
        time: '02:22 AM',
        dateDivider: 'Friday',
        text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      },
      {
        id: 'msg-2',
        senderName: 'Taylor Swift',
        senderAvatar: '/saylor.webp',
        time: '02:22 AM',
        text: 'Lorem ipsum dolor sit amet,',
        reactions: [{ emoji: '❤️', count: 8 }],
      },
      {
        id: 'msg-3',
        senderName: 'Gerard White',
        senderAvatar: '/gerard.webp',
        time: '02:22 AM',
        dateDivider: 'Today',
        text: 'Etiam tempor orci eu lobortis elementum. Tincidunt augue interdum velit euismod in pellentesque massa placerat duis. Facilisis magna etiam tempor orci eu lobortis.',
        reactions: [
          { emoji: '👍', count: 22 },
          { emoji: '❤️', count: 8 },
        ],
      },
    ],
  },
  steve: {
    title: 'Steve',
    subtitle: 'Online',
    avatarUrl: '/steve.webp',
    messages: [
      {
        id: 'msg-steve-1',
        senderName: 'Steve',
        senderAvatar: '/steve.webp',
        time: '01:15 PM',
        dateDivider: 'Today',
        text: 'Hey! Are you coming to practice today?',
      },
      {
        id: 'msg-steve-2',
        senderName: 'You',
        senderAvatar: '/userPlaceholder.webp',
        time: '01:18 PM',
        text: 'Yup',
      },
    ],
  },
  david: {
    title: 'David',
    subtitle: 'Offline',
    avatarUrl: '/david.webp',
    messages: [
      {
        id: 'msg-david-1',
        senderName: 'David',
        senderAvatar: '/david.webp',
        time: '11:00 AM',
        dateDivider: 'Yesterday',
        text: 'Hey',
      },
    ],
  },
};

export const MessagingPage: React.FC<PageProps> = ({ onNavigate, onLogout }) => {
  const { permissions } = useFeedPermissions(onNavigate);
  const [activeNavTab, setActiveNavTab] = useState('messaging');
  const [selectedChatId, setSelectedChatId] = useState<string>('hockey-club');
  const [chats] = useState<ChatItem[]>(DEFAULT_CHATS);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);

  const handleTabChange = (tab: string) => {
    setActiveNavTab(tab);
    if (onNavigate) {
      onNavigate(tab);
    }
  };

  const handleSendMessage = (text: string) => {
    if (!selectedChatId) return;

    const currentConv = conversations[selectedChatId];
    if (!currentConv) return;

    const newMsg: MessageItem = {
      id: `msg-${Date.now()}`,
      senderName: 'You',
      senderAvatar: '/userPlaceholder.webp',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text,
    };

    setConversations({
      ...conversations,
      [selectedChatId]: {
        ...currentConv,
        messages: [...currentConv.messages, newMsg],
      },
    });
  };

  const activeConv = selectedChatId ? conversations[selectedChatId] : undefined;

  return (
    <div className="mhn-app-shell">
      <LeftSidebar activeTab={activeNavTab} onTabChange={handleTabChange} onLogout={onLogout} />

      <div className="mhn-app-content mhn-messaging-page-root">
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
              chats={chats}
              selectedChatId={selectedChatId}
              onSelectChat={(id) => setSelectedChatId(id)}
            />
          </aside>

          {/* Right Column: Chat Conversation Window */}
          <section className="mhn-messaging-conversation-col">
            <ChatConversation
              title={activeConv?.title}
              subtitle={activeConv?.subtitle}
              avatarUrl={activeConv?.avatarUrl}
              bannerUrl={activeConv?.bannerUrl}
              messages={activeConv?.messages}
              onSendMessage={handleSendMessage}
            />
          </section>
        </main>
      </div>
    </div>
  );
};

