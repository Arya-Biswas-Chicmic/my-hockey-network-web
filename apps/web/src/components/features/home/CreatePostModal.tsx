import React, { useState, useRef } from 'react';
import { useAuth } from '../../../hooks/use-auth';
import { resolveMediaUrl } from '../../../utils/mediaUtils';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    content: string,
    postImage?: string,
    privacySettings?: { audience: string; shareWith?: string; dontShareWith?: string; locationTag?: string },
    imageFile?: File
  ) => void;
  isLoading?: boolean;
  userName?: string;
  userAvatar?: string;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  userName,
  userAvatar,
}) => {
  const { user } = useAuth();
  const resolvedName = user?.profile?.displayName || (user as any)?.displayName || userName || 'Player';
  const rawAvatar = user?.profile?.avatarUrl || (user as any)?.avatarUrl || userAvatar;
  const resolvedAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');

  const [screen, setScreen] = useState<'create' | 'audience' | 'custom'>('create');
  const [content, setContent] = useState('');
  const [audience, setAudience] = useState<'Everyone' | 'Groups' | 'Custom'>('Everyone');
  const [tempAudience, setTempAudience] = useState<'Everyone' | 'Groups' | 'Custom'>('Everyone');
  const [shareWithEmails, setShareWithEmails] = useState('');
  const [dontShareWithEmails, setDontShareWithEmails] = useState('');

  const [postImage, setPostImage] = useState<string | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [locationTag, setLocationTag] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPostImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!content.trim() && !postImage && !postImageFile) || isLoading) return;

    onSubmit(
      content.trim(),
      postImage || undefined,
      {
        audience,
        shareWith: shareWithEmails || undefined,
        dontShareWith: dontShareWithEmails || undefined,
        locationTag: locationTag || undefined,
      },
      postImageFile || undefined
    );
  };

  const handleAudienceOptionClick = (opt: 'Everyone' | 'Groups' | 'Custom') => {
    setTempAudience(opt);
    if (opt === 'Custom') {
      setScreen('custom');
    }
  };

  return (
    <div className="mhn-modal-overlay" onClick={onClose}>
      <div className="mhn-create-post-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* ==================== SCREEN 1: CREATE POST ==================== */}
        {screen === 'create' && (
          <>
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
                src={resolvedAvatar}
                alt={resolvedName}
                className="mhn-modal-user-avatar"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                }}
              />
              <div className="mhn-modal-user-meta">
                <span className="mhn-modal-user-name">{resolvedName}</span>
                <button
                  type="button"
                  className="mhn-audience-pill"
                  onClick={() => {
                    setTempAudience(audience);
                    setScreen('audience');
                  }}
                >
                  <span>{audience}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
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
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0091FF" strokeWidth="2">
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
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="#0091FF">
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
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="#0091FF">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Submit Post Button */}
              <div className="mhn-modal-submit-row">
                <button
                  type="submit"
                  disabled={(!content.trim() && !postImage) || isLoading}
                  className={`mhn-modal-submit-btn ${(content.trim() || postImage) && !isLoading ? 'active' : 'disabled'}`}
                >
                  {isLoading ? (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <svg className="mhn-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" fill="currentColor" />
                      </svg>
                      Posting...
                    </span>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ==================== SCREEN 2: POST AUDIENCE ==================== */}
        {screen === 'audience' && (
          <>
            <div className="mhn-modal-header-nav">
              <button
                type="button"
                className="mhn-modal-nav-btn"
                onClick={() => setScreen('create')}
                aria-label="Back"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h2 className="mhn-modal-title">Post Audience</h2>
              <button
                type="button"
                className="mhn-modal-nav-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mhn-audience-body">
              <div className="mhn-audience-subtitle-box">
                <h3 className="mhn-audience-subtitle-title">Who can see your post?</h3>
                <p className="mhn-audience-subtitle-text">
                  Your post will appear in Feed, on your profile and in search results.
                </p>
              </div>

              <div className="mhn-audience-options-list">
                <label className="mhn-audience-option-row" onClick={() => handleAudienceOptionClick('Everyone')}>
                  <span>Everyone</span>
                  <input
                    type="radio"
                    name="audienceOpt"
                    checked={tempAudience === 'Everyone'}
                    onChange={() => handleAudienceOptionClick('Everyone')}
                    className="mhn-radio-input"
                  />
                </label>

                <label className="mhn-audience-option-row" onClick={() => handleAudienceOptionClick('Groups')}>
                  <span>Groups</span>
                  <input
                    type="radio"
                    name="audienceOpt"
                    checked={tempAudience === 'Groups'}
                    onChange={() => handleAudienceOptionClick('Groups')}
                    className="mhn-radio-input"
                  />
                </label>

                <label className="mhn-audience-option-row" onClick={() => handleAudienceOptionClick('Custom')}>
                  <span>Custom</span>
                  <input
                    type="radio"
                    name="audienceOpt"
                    checked={tempAudience === 'Custom'}
                    onChange={() => handleAudienceOptionClick('Custom')}
                    className="mhn-radio-input"
                  />
                </label>
              </div>

              <button
                type="button"
                className="mhn-audience-footer-btn"
                onClick={() => {
                  setAudience(tempAudience);
                  setScreen('create');
                }}
              >
                Done
              </button>
            </div>
          </>
        )}

        {/* ==================== SCREEN 3: CUSTOM PRIVACY ==================== */}
        {screen === 'custom' && (
          <>
            <div className="mhn-modal-header-nav">
              <button
                type="button"
                className="mhn-modal-nav-btn"
                onClick={() => setScreen('audience')}
                aria-label="Back"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h2 className="mhn-modal-title">Custom privacy</h2>
              <button
                type="button"
                className="mhn-modal-nav-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="mhn-custom-privacy-body">
              {/* Share with */}
              <div className="mhn-custom-field-group">
                <h3 className="mhn-custom-field-label">Share with</h3>
                <textarea
                  className="mhn-custom-textarea"
                  placeholder="Type mail of the users"
                  value={shareWithEmails}
                  onChange={(e) => setShareWithEmails(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Don't share with */}
              <div className="mhn-custom-field-group">
                <h3 className="mhn-custom-field-label">Don't share with</h3>
                <textarea
                  className="mhn-custom-textarea"
                  placeholder="Type mail of the users"
                  value={dontShareWithEmails}
                  onChange={(e) => setDontShareWithEmails(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Footnote note */}
              <p className="mhn-custom-footnote">
                Anyone you include here or have on your restricted list won't be able to see this post unless you tag them. We don't let people know when you choose not to share something with them.
              </p>

              {/* Actions row */}
              <div className="mhn-custom-actions-row">
                <button
                  type="button"
                  className="mhn-btn-custom-cancel"
                  onClick={() => setScreen('audience')}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="mhn-btn-custom-done"
                  onClick={() => {
                    setAudience('Custom');
                    setScreen('create');
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
