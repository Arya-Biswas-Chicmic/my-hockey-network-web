import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import React, { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { MoreHorizontal, Pencil, Search } from 'lucide-react';
import { FallbackImage } from '@/components/ui/fallback-image';

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
  const debouncedSearchQuery = useDebounce(searchQuery, 800);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'groups', label: 'Groups' },
  ];

  const filteredChats = chats.filter((c) => {
    const matchesSearch =
      !debouncedSearchQuery.trim() ||
      c.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      (c.lastMessage && c.lastMessage.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
    if (activeCategory === 'unread') return matchesSearch && Boolean(c.unreadCount);
    if (activeCategory === 'groups') return matchesSearch && Boolean(c.isGroup);
    return matchesSearch;
  });

  return (
    <div className="mhn-chat-sidebar-card">
      {/* Top Header */}
      <div className="mhn-chat-sidebar-header">
        <h3 className="mhn-chat-sidebar-title">Chats</h3>
        <div className="mhn-chat-header-actions">
          <Button className="mhn-chat-icon-btn" aria-label="More options">
            <MoreHorizontal size={18} aria-hidden="true" />
          </Button>
          <Button className="mhn-chat-icon-btn" aria-label="New chat">
            <Pencil size={18} aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Search Input Box */}
      <div className="mhn-chat-search-box">
        <div className="mhn-chat-search-wrapper">
          <Search className="mhn-chat-search-icon" size={16} aria-hidden="true" />
          <Input
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
          <Button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`mhn-chat-pill ${activeCategory === cat.id ? 'mhn-chat-pill-active' : ''}`}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Chat List Items */}
      <div className="mhn-chat-list">
        {filteredChats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat && onSelectChat(chat.id)}
            className={`mhn-chat-item ${selectedChatId === chat.id ? 'mhn-chat-item-active' : ''}`}
          >
            <div className="mhn-chat-item-avatar-box">
              <FallbackImage
                src={chat.avatar}
                alt={chat.name}
                fill
                className="mhn-chat-item-avatar-img"
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
