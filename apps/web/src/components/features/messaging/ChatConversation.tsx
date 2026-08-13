import React, { useState } from 'react';

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
    reactions: [
      { emoji: '❤️', count: 8 }
    ]
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
            <img
              src={avatarUrl}
              alt={title}
              className="mhn-conv-avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/CoachTeam.png';
              }}
            />
          </div>
          <div className="mhn-conv-meta">
            <h3 className="mhn-conv-title">{title}</h3>
            <span className="mhn-conv-subtitle">{subtitle}</span>
          </div>
        </div>

        <div className="mhn-conv-header-actions">
          <button className="mhn-conv-action-btn" aria-label="Search messages">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
          <button className="mhn-conv-action-btn" aria-label="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
          <button className="mhn-btn-conv-plus" aria-label="Add members">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
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
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="mhn-msg-avatar-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                }}
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
              <img
                src={msg.senderAvatar}
                alt={msg.senderName}
                className="mhn-msg-avatar-img"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                }}
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
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Enter your response..."
            className="mhn-chat-input-field"
          />

          <div className="mhn-chat-input-right-actions">
            {/* Emoji Icon Button */}
            <button type="button" className="mhn-chat-input-action-btn" aria-label="Add emoji">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>

            {/* GIF Icon Button */}
            <button type="button" className="mhn-chat-input-action-btn mhn-chat-gif-btn" aria-label="Add GIF">
              GIF
            </button>

            {/* Upload Icon Button */}
            <button type="button" className="mhn-chat-input-action-btn" aria-label="Upload file">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                <polyline points="7 9 12 4 17 9" />
                <line x1="12" y1="4" x2="12" y2="16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Circular Send Button */}
        <button
          onClick={handleSendMessage}
          className="mhn-btn-chat-send"
          aria-label="Send message"
        >
          <img src="/send.png" alt="Send message" />
        </button>
      </div>
    </div>
  );
};
