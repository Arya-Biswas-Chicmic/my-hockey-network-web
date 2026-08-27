import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { FallbackImage } from '@/components/ui/fallback-image';
import React, { useState } from 'react';
import { MessageCircle, Plus, Search, Send, Settings, Smile, Upload } from 'lucide-react';
import { NoDataFound } from '@/components/common/no-data-found';

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
  dateDivider?: string;
}

interface ChatConversationProps {
  title?: string;
  subtitle?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  messages?: MessageItem[];
  onSendMessage?: (message: string) => void | Promise<void>;
}

export const ChatConversation: React.FC<ChatConversationProps> = ({
  title,
  subtitle,
  avatarUrl,
  bannerUrl,
  messages = [],
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSendMessage = async () => {
    const message = inputText.trim();
    if (!message || !onSendMessage) return;
    await onSendMessage(message);
    setInputText('');
  };

  if (!title) {
    return (
      <div className="mhn-chat-conversation-card mhn-chat-conversation-empty">
        <NoDataFound
          title="Select a Conversation"
          description="Choose a conversation to view messages."
          icon={<MessageCircle size={34} aria-hidden="true" />}
        />
      </div>
    );
  }

  return (
    <div className="mhn-chat-conversation-card">
      {/* Top Header */}
      <div className="mhn-chat-conv-header">
        <div className="mhn-conv-user-group">
          <div className="mhn-conv-avatar-box">
            <FallbackImage
              src={avatarUrl || '/hockeyClub.png'}
              alt={title}
              fill
              fallbackSrc="/hockeyClub.png"
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
        {/* Header Group Banner Card if provided */}
        {bannerUrl && (
          <div className="mhn-chat-group-banner">
            <FallbackImage
              src={bannerUrl}
              alt="Group Cover"
              fill
              fallbackSrc="/cover.png"
              className="mhn-chat-banner-img"
            />
          </div>
        )}

        {messages.length === 0 ? (
          <NoDataFound title="No Messages" description="Start the conversation when messaging becomes available." />
        ) : (
          messages.map((msg) => (
            <React.Fragment key={msg.id}>
              {msg.dateDivider && (
                <div className="mhn-chat-date-divider">
                  <span className="mhn-date-divider-label">{msg.dateDivider}</span>
                </div>
              )}

              <div className="mhn-message-row">
                <div className="mhn-msg-avatar-box">
                  <FallbackImage
                    src={msg.senderAvatar}
                    alt={msg.senderName}
                    fill
                    fallbackSrc="/userPlaceholder.png"
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
                          <span className="mhn-reaction-emoji">{r.emoji}</span>
                          <span className="mhn-reaction-count">{r.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))
        )}
      </div>

      {/* Message Input Footer Bar */}
      <div className="mhn-chat-input-footer">
        <div className="mhn-chat-input-pill-wrapper">
          <Input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void handleSendMessage();
            }}
            placeholder="Enter your response..."
            className="mhn-chat-input-field"
          />

          <div className="mhn-chat-input-right-actions">
            {/* Emoji Icon Button */}
            <Button type="button" className="mhn-chat-input-action-btn" aria-label="Add emoji">
              <Smile size={18} aria-hidden="true" />
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
          onClick={() => void handleSendMessage()}
          className="mhn-btn-chat-send"
          aria-label="Send message"
          disabled={!inputText.trim()}
        >
          <Send size={18} aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
};

