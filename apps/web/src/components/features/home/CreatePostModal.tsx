import React, { useState, useRef } from 'react';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, postImage?: string) => void;
  userName?: string;
  userAvatar?: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  userName = 'Alexander Ovechkin',
  userAvatar = '/ovechkin.png',
}) => {
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState('Everyone');
  const [showAudienceMenu, setShowAudienceMenu] = useState(false);
  const [postImage, setPostImage] = useState<string | null>(null);
  const [locationTag, setLocationTag] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !postImage) return;

    onSubmit(content.trim(), postImage || undefined);
    setContent('');
    setPostImage(null);
    setLocationTag(null);
    onClose();
  };

  return (
    <div className="mhn-modal-overlay" onClick={onClose}>
      <div className="mhn-create-post-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="mhn-modal-header">
          <h2 className="mhn-modal-title">Create post</h2>
          <button className="mhn-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* User Author & Audience Row */}
        <div className="mhn-modal-user-row">
          <img
            src={userAvatar}
            alt={userName}
            className="mhn-modal-user-avatar"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/userPlaceholder.png';
            }}
          />
          <div className="mhn-modal-user-meta">
            <span className="mhn-modal-user-name">{userName}</span>
            <div className="mhn-audience-dropdown-container">
              <button
                type="button"
                className="mhn-audience-pill"
                onClick={() => setShowAudienceMenu(!showAudienceMenu)}
              >
                <span>{audience}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {showAudienceMenu && (
                <div className="mhn-audience-menu">
                  <div className={`mhn-audience-item ${audience === 'Everyone' ? 'active' : ''}`} onClick={() => { setAudience('Everyone'); setShowAudienceMenu(false); }}>
                    Everyone
                  </div>
                  <div className={`mhn-audience-item ${audience === 'Connections' ? 'active' : ''}`} onClick={() => { setAudience('Connections'); setShowAudienceMenu(false); }}>
                    Connections
                  </div>
                  <div className={`mhn-audience-item ${audience === 'Team Members' ? 'active' : ''}`} onClick={() => { setAudience('Team Members'); setShowAudienceMenu(false); }}>
                    Team Members
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Post Textarea Content */}
        <form onSubmit={handleSubmit} className="mhn-modal-form">
          <textarea
            className="mhn-modal-textarea"
            placeholder="What do you want to talk about?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            autoFocus
          />

          {/* Attached Image Preview */}
          {postImage && (
            <div className="mhn-modal-image-preview-wrapper">
              <img src={postImage} alt="Post preview" className="mhn-modal-image-preview" />
              <button
                type="button"
                className="mhn-modal-remove-img-btn"
                onClick={() => setPostImage(null)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          )}

          {/* Attached Location Tag */}
          {locationTag && (
            <div className="mhn-modal-location-tag">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0B66C2" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>{locationTag}</span>
              <button type="button" onClick={() => setLocationTag(null)}>×</button>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />

          {/* Action Toolbar */}
          <div className="mhn-modal-toolbar">
            <div className="mhn-modal-toolbar-actions">
              {/* Photo Icon Button */}
              <button
                type="button"
                className="mhn-modal-icon-btn"
                onClick={() => fileInputRef.current?.click()}
                title="Add photo"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="#0B66C2" stroke="none">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z" />
                </svg>
              </button>

              {/* Location Icon Button */}
              <button
                type="button"
                className="mhn-modal-icon-btn"
                onClick={() => setLocationTag(locationTag ? null : 'Austria, Europe')}
                title="Add location"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0B66C2" stroke="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Submit Post Button */}
          <div className="mhn-modal-submit-row">
            <button
              type="submit"
              disabled={!content.trim() && !postImage}
              className={`mhn-modal-submit-btn ${content.trim() || postImage ? 'active' : 'disabled'}`}
            >
              Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
