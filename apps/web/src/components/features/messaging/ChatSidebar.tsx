import React, { useState } from 'react';

export interface ChatItem {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  time?: string;
  unreadCount?: number;
  isGroup?: boolean;
}

interface ChatSidebarProps {
  chats?: ChatItem[];
  selectedChatId?: string;
  onSelectChat?: (id: string) => void;
}

const DEFAULT_CHATS: ChatItem[] = [
  {
    id: 'c1',
    name: 'Hockey Club',
    avatar: '/HockeyClub2.png',
    isGroup: true
  },
  {
    id: 'c2',
    name: 'Steve',
    avatar: '/steve.png',
    lastMessage: 'You: hy ·'
  },
  {
    id: 'c3',
    name: 'David',
    avatar: '/david.png',
    lastMessage: 'Hy',
    unreadCount: 1
  }
];

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  chats = DEFAULT_CHATS,
  selectedChatId = 'c1',
  onSelectChat
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'groups', label: 'Groups' },
  ];

  return (
    <div className="mhn-chat-sidebar-card">
      {/* Top Header */}
      <div className="mhn-chat-sidebar-header">
        <h3 className="mhn-chat-sidebar-title">Chats</h3>
        <div className="mhn-chat-header-actions">
          <button className="mhn-chat-icon-btn" aria-label="More options">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="19" cy="12" r="2" />
            </svg>
          </button>
          <button className="mhn-chat-icon-btn" aria-label="New chat">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="mhn-chat-search-box">
        <div className="mhn-chat-search-wrapper">
          <svg className="mhn-chat-search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="mhn-chat-search-input"
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="mhn-chat-category-pills">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`mhn-chat-pill ${activeCategory === cat.id ? 'mhn-chat-pill-active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Chat List Items */}
      <div className="mhn-chat-list">
        {chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat && onSelectChat(chat.id)}
            className={`mhn-chat-item ${selectedChatId === chat.id ? 'mhn-chat-item-active' : ''}`}
          >
            <div className="mhn-chat-item-avatar-box">
              <img
                src={chat.avatar}
                alt={chat.name}
                className="mhn-chat-item-avatar-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                }}
              />
            </div>

            <div className="mhn-chat-item-meta">
              <h4 className="mhn-chat-item-name">{chat.name}</h4>
              {chat.lastMessage && (
                <span className="mhn-chat-item-last-msg">{chat.lastMessage}</span>
              )}
            </div>

            {chat.unreadCount && chat.unreadCount > 0 ? (
              <div className="mhn-chat-unread-dot" />
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};
