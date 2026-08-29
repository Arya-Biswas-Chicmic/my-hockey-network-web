import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { FallbackImage } from '@/components/ui/fallback-image';
import { FilePickerButton } from '@/components/ui/file-picker-button';
import { Modal } from '@/components/ui/modal';
import React, { useState } from 'react';
import { FileText, Image as ImageIcon, Lock, MessageCircle, Search, Send, Smile } from 'lucide-react';
import { NoDataFound } from '@/components/common/no-data-found';
import { showErrorToast, showInfoToast } from '@/utils/toast';

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
  /** Defaults to `true` — see `ChatItem.canMessage`. */
  canMessage?: boolean;
}

// A compact, commonly-used set rather than a full emoji library — feedback
// 2026-08-29: "on click on emoji open emoji popup and show list of images
// with light and dark colors". Native Unicode emoji already render fully
// colored via the OS/browser's own color-emoji font, so no image assets are
// needed; the popover panel itself follows the app's dark/light theme via
// the same CSS variables every other popover here uses.
const QUICK_EMOJI = ['😀', '😂', '😍', '👍', '🙏', '🎉', '🔥', '👏', '😢', '😮', '🏒', '🥅', '🏆', '💪', '❤️', '😎'];

const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

/** Matches `PostCardActions.tsx`'s repost menu — a `fixed inset-0` backdrop
 * to close on outside click plus an absolutely-positioned panel, rather
 * than pulling in a new popover dependency for two small menus. */
function usePopoverToggle() {
  const [open, setOpen] = useState(false);
  return { open, toggle: () => setOpen((prev) => !prev), close: () => setOpen(false) };
}

export const ChatConversation: React.FC<ChatConversationProps> = ({
  title,
  subtitle,
  avatarUrl,
  bannerUrl,
  messages = [],
  onSendMessage,
  canMessage = true,
}) => {
  const [inputText, setInputText] = useState('');
  const emojiPopover = usePopoverToggle();
  const attachPopover = usePopoverToggle();
  // Avatars/banner render via `object-fit: cover` so they fill their small,
  // fixed-aspect-ratio boxes — which necessarily crops anything that doesn't
  // match that box's own aspect ratio (feedback 2026-08-30: "click on the
  // media and media is getting cropped"). Clicking now opens the full,
  // uncropped image instead of only ever showing the cropped thumbnail.
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string } | null>(null);

  const handleSendMessage = async () => {
    const message = inputText.trim();
    if (!message || !onSendMessage) return;
    await onSendMessage(message);
    setInputText('');
  };

  const handleAttachmentFiles = (files: File[]) => {
    if (files.length === 0) return;
    const oversized = files.filter((file) => file.size > MAX_ATTACHMENT_BYTES);
    if (oversized.length > 0) {
      showErrorToast(`${oversized.length === files.length ? 'Each file' : `${oversized.length} file(s)`} must be under 5MB.`);
    }
    const accepted = files.filter((file) => file.size <= MAX_ATTACHMENT_BYTES);
    if (accepted.length > 0) {
      showInfoToast('Attachments will send once messaging is connected to the API.');
    }
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
          <Button
            type="button"
            variant="unstyled"
            className="mhn-conv-avatar-box"
            aria-label={`View full ${title} photo`}
            onClick={() => setPreviewImage({ src: avatarUrl || '/hockeyClub.webp', alt: title })}
          >
            <FallbackImage
              src={avatarUrl || '/hockeyClub.webp'}
              alt={title}
              fill
              fallbackSrc="/hockeyClub.webp"
              className="mhn-conv-avatar-img"
            />
          </Button>
          <div className="mhn-conv-meta">
            <h3 className="mhn-conv-title">{title}</h3>
            <span className="mhn-conv-subtitle">{subtitle}</span>
          </div>
        </div>

        {/* Add-members/Settings removed — feedback 2026-08-29: "remove +
            icons from the message details section and also remove setting
            icon"; neither has a real feature behind it yet. Search stays. */}
        <div className="mhn-conv-header-actions">
          <Button className="mhn-conv-action-btn" aria-label="Search messages">
            <Search size={18} aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Messages Stream Scroll Area */}
      <div className="mhn-chat-messages-stream">
        {/* Header Group Banner Card if provided */}
        {bannerUrl && (
          <Button
            type="button"
            variant="unstyled"
            className="mhn-chat-group-banner"
            aria-label="View full group cover photo"
            onClick={() => setPreviewImage({ src: bannerUrl, alt: 'Group Cover' })}
          >
            <FallbackImage
              src={bannerUrl}
              alt="Group Cover"
              fill
              fallbackSrc="/cover.webp"
              className="mhn-chat-banner-img"
            />
          </Button>
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
                    fallbackSrc="/userPlaceholder.webp"
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

      {/* Message Input Footer Bar — replaced entirely with a notice when
          this chat doesn't allow the viewer to post (feedback 2026-08-29:
          "where we don't have permission show only admin can message"). */}
      {canMessage ? (
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
              {/* Emoji Icon Button — GIF button removed entirely (feedback
                  2026-08-29: "remove gif no need here"). */}
              <div className="mhn-chat-popover-anchor relative">
                <Button
                  type="button"
                  className="mhn-chat-input-action-btn"
                  aria-label="Add emoji"
                  aria-haspopup="menu"
                  aria-expanded={emojiPopover.open}
                  onClick={emojiPopover.toggle}
                >
                  <Smile size={18} aria-hidden="true" />
                </Button>

                {emojiPopover.open && (
                  <>
                    <Button type="button" className="mhn-repost-menu-backdrop" aria-label="Close emoji picker" onClick={emojiPopover.close} />
                    <div className="mhn-emoji-popover" role="menu">
                      {QUICK_EMOJI.map((emoji) => (
                        <Button
                          key={emoji}
                          type="button"
                          role="menuitem"
                          className="mhn-emoji-popover-item"
                          onClick={() => {
                            setInputText((prev) => prev + emoji);
                            emojiPopover.close();
                          }}
                          aria-label={`Insert ${emoji}`}
                        >
                          {emoji}
                        </Button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Upload Icon Button */}
              <div className="mhn-chat-popover-anchor relative">
                <Button
                  type="button"
                  className="mhn-chat-input-action-btn"
                  aria-label="Upload file"
                  aria-haspopup="menu"
                  aria-expanded={attachPopover.open}
                  onClick={attachPopover.toggle}
                >
                  <ImageIcon size={18} aria-hidden="true" />
                </Button>

                {attachPopover.open && (
                  <>
                    <Button type="button" className="mhn-repost-menu-backdrop" aria-label="Close attachment menu" onClick={attachPopover.close} />
                    <div className="mhn-repost-menu-popover mhn-repost-menu-popover--right" role="menu">
                      <FilePickerButton
                        accept="image/*,video/*"
                        multiple
                        onFilesSelected={(files) => {
                          attachPopover.close();
                          handleAttachmentFiles(files);
                        }}
                        buttonProps={{ variant: 'unstyled', className: 'mhn-repost-menu-item', role: 'menuitem' }}
                      >
                        <ImageIcon size={16} aria-hidden="true" />
                        <span>Photo / Video</span>
                      </FilePickerButton>
                      <FilePickerButton
                        accept=".pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                        multiple
                        onFilesSelected={(files) => {
                          attachPopover.close();
                          handleAttachmentFiles(files);
                        }}
                        buttonProps={{ variant: 'unstyled', className: 'mhn-repost-menu-item', role: 'menuitem' }}
                      >
                        <FileText size={16} aria-hidden="true" />
                        <span>Document</span>
                      </FilePickerButton>
                    </div>
                  </>
                )}
              </div>
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
      ) : (
        <div className="mhn-chat-input-footer mhn-chat-input-footer-locked">
          <Lock size={16} aria-hidden="true" />
          <span>Only admin can message in this group</span>
        </div>
      )}

      <Modal
        open={previewImage !== null}
        onClose={() => setPreviewImage(null)}
        title={previewImage?.alt}
        className="mhn-chat-image-preview-card"
      >
        {previewImage && (
          <FallbackImage
            src={previewImage.src}
            alt={previewImage.alt}
            width={800}
            height={800}
            fallbackSrc="/hockeyClub.webp"
            className="mhn-chat-image-preview-img"
          />
        )}
      </Modal>
    </div>
  );
};
