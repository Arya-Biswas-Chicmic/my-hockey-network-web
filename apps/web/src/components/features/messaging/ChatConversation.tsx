import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import Image from 'next/image';
import { FallbackImage } from '@/components/ui/fallback-image';
import React, { useState } from 'react';
import { Plus, Search, Settings, Smile, Upload } from 'lucide-react';

export interface ReactionItem {
  emoji: string;
  count: number;
}

export interface MessageItem {
  id: string;
  senderName: string;
  senderAvatar: string;
  time: string;
  text: string;
  reactions?: ReactionItem[];
}

interface ChatConversationProps {
  title?: string;
  subtitle?: string;
  avatarUrl?: string;
}

const DEFAULT_MESSAGES_FRIDAY: MessageItem[] = [
  {
    id: 'm1',
    senderName: 'Mai Sakurajima',
    senderAvatar: '/mai.png',
    time: '02:22 AM',
    text: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
  },
  {
    id: 'm2',
    senderName: 'Saylor Swift',
    senderAvatar: '/saylor.png',
    time: '02:22 AM',
    text: 'Lorem ipsum dolor sit amet,',
    reactions: []
  }
];

const DEFAULT_MESSAGES_TODAY: MessageItem[] = [
  {
    id: 'm3',
    senderName: 'Gerard White',
    senderAvatar: '/gerard.png',
    time: '02:22 AM',
    text: 'Etiam tempor orci eu lobortis elementum. Tincidunt augue interdum velit euismod in pellentesque massa placerat duis. Facilisis magna etiam tempor orci eu lobortis',
    reactions: [
      { emoji: '👍', count: 22 },
      { emoji: '😀', count: 8 }
    ]
  }
];

export const ChatConversation: React.FC<ChatConversationProps> = ({
  title = 'Hockey Club',
  subtitle = '187 People • 4 Online',
  avatarUrl = '/HockeyClub2.png'
}) => {
  const [inputText, setInputText] = useState('');
  const [messagesToday, setMessagesToday] = useState<MessageItem[]>(DEFAULT_MESSAGES_TODAY);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMsg: MessageItem = {
      id: Date.now().toString(),
      senderName: 'Jack Ruffle',
      senderAvatar: '/player.png',
      time: 'Just now',
      text: inputText.trim()
    };
    setMessagesToday(prev => [...prev, newMsg]);
    setInputText('');
  };

  return (
    <div className="mhn-chat-conversation-card">
      {/* Top Header */}
      <div className="mhn-chat-conv-header">
        <div className="mhn-conv-user-group">
          <div className="mhn-conv-avatar-box">
            <FallbackImage
              src={avatarUrl}
              alt={title}
              fill
              fallbackSrc="/CoachTeam.png"
              className="mhn-conv-avatar-img"
            />
          </div>
          <div className="mhn-conv-meta">
            <h3 className="mhn-conv-title">{title}</h3>
            <span className="mhn-conv-subtitle">{subtitle}</span>
          </div>
        </div>

        <div className="mhn-conv-header-actions">
          <Button className="mhn-conv-action-btn" aria-label="Search messages">
            <Search size={18} aria-hidden="true" />
          </Button>
          <Button className="mhn-conv-action-btn" aria-label="Settings">
            <Settings size={18} aria-hidden="true" />
          </Button>
          <Button className="mhn-btn-conv-plus" aria-label="Add members">
            <Plus size={18} aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Messages Stream Scroll Area */}
      <div className="mhn-chat-messages-stream">
        {/* Date Divider 1: Friday */}
        <div className="mhn-chat-date-divider">
          <span className="mhn-date-divider-label">Friday</span>
        </div>

        {DEFAULT_MESSAGES_FRIDAY.map((msg) => (
          <div key={msg.id} className="mhn-message-row">
            <div className="mhn-msg-avatar-box">
              <FallbackImage
                src={msg.senderAvatar}
                alt={msg.senderName}
                fill
                className="mhn-msg-avatar-img"
              />
            </div>

            <div className="mhn-msg-content-col">
              <div className="mhn-msg-header">
                <span className="mhn-msg-sender-name">{msg.senderName}</span>
                <span className="mhn-msg-timestamp">{msg.time}</span>
              </div>
              <div className="mhn-msg-bubble">
                <p className="mhn-msg-text">{msg.text}</p>
              </div>

              {msg.reactions && msg.reactions.length > 0 && (
                <div className="mhn-msg-reactions-row">
                  {msg.reactions.map((r, idx) => (
                    <div key={idx} className="mhn-reaction-pill">
                      <span>{r.emoji}</span>
                      <span className="mhn-reaction-count">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Date Divider 2: Today */}
        <div className="mhn-chat-date-divider">
          <span className="mhn-date-divider-label">Today</span>
        </div>

        {messagesToday.map((msg) => (
          <div key={msg.id} className="mhn-message-row">
            <div className="mhn-msg-avatar-box">
              <FallbackImage
                src={msg.senderAvatar}
                alt={msg.senderName}
                fill
                className="mhn-msg-avatar-img"
              />
            </div>

            <div className="mhn-msg-content-col">
              <div className="mhn-msg-header">
                <span className="mhn-msg-sender-name">{msg.senderName}</span>
                <span className="mhn-msg-timestamp">{msg.time}</span>
              </div>
              <div className="mhn-msg-bubble">
                <p className="mhn-msg-text">{msg.text}</p>
              </div>

              {msg.reactions && msg.reactions.length > 0 && (
                <div className="mhn-msg-reactions-row">
                  {msg.reactions.map((r, idx) => (
                    <div key={idx} className="mhn-reaction-pill">
                      <span>{r.emoji}</span>
                      <span className="mhn-reaction-count">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Message Input Footer Bar */}
      <div className="mhn-chat-input-footer">
        <div className="mhn-chat-input-pill-wrapper">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Enter your response..."
            className="mhn-chat-input-field"
          />

          <div className="mhn-chat-input-right-actions">
            {/* Emoji Icon Button */}
            <Button type="button" className="mhn-chat-input-action-btn" aria-label="Add emoji">
              <Smile size={20} aria-hidden="true" />
            </Button>

            {/* GIF Icon Button */}
            <Button type="button" className="mhn-chat-input-action-btn mhn-chat-gif-btn" aria-label="Add GIF">
              GIF
            </Button>

            {/* Upload Icon Button */}
            <Button type="button" className="mhn-chat-input-action-btn" aria-label="Upload file">
              <Upload size={18} aria-hidden="true" />
            </Button>
          </div>
        </div>

        {/* Circular Send Button */}
        <Button
          onClick={handleSendMessage}
          className="mhn-btn-chat-send"
          aria-label="Send message"
        >
          <Image src="/send.png" alt="Send message" width={18} height={18} />
        </Button>
      </div>
    </div>
  );
};
