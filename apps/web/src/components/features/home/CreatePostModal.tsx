import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/FormControls';
import React, { useState, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { isEmailValid } from '@my-hockey-network/validation';
import { useFormik, type FormikErrors } from 'formik';
import { ChevronDown, ChevronLeft, Image, LoaderCircle, MapPin, X } from 'lucide-react';

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

interface CreatePostFormValues {
  content: string;
  audience: 'Everyone' | 'Groups' | 'Custom';
  shareWithEmails: string;
  dontShareWithEmails: string;
  locationTag: string;
}

const parseEmailList = (input: string) =>
  input.split(/[, \n;]+/).map((email) => email.trim()).filter(Boolean);

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  userName,
  userAvatar,
}) => {
  const { user } = useAuth();
  const resolvedName = user?.profile?.displayName || userName || 'Player';
  const rawAvatar = user?.profile?.avatarUrl || userAvatar;
  const resolvedAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');

  const [screen, setScreen] = useState<'create' | 'audience' | 'custom'>('create');
  const [tempAudience, setTempAudience] = useState<'Everyone' | 'Groups' | 'Custom'>('Everyone');
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik<CreatePostFormValues>({
    initialValues: {
      content: '',
      audience: 'Everyone',
      shareWithEmails: '',
      dontShareWithEmails: '',
      locationTag: '',
    },
    validate: (values) => {
      const errors: FormikErrors<CreatePostFormValues> = {};
      const invalidShare = parseEmailList(values.shareWithEmails).filter((email) => !isEmailValid(email));
      const invalidExcluded = parseEmailList(values.dontShareWithEmails).filter((email) => !isEmailValid(email));
      if (invalidShare.length) errors.shareWithEmails = `Invalid email: ${invalidShare.join(', ')}`;
      if (invalidExcluded.length) errors.dontShareWithEmails = `Invalid email: ${invalidExcluded.join(', ')}`;
      return errors;
    },
    onSubmit: (values) => {
      if ((!values.content.trim() && !postImage && !postImageFile) || isLoading) return;
      onSubmit(
        values.content.trim(),
        postImage || undefined,
        {
          audience: values.audience,
          shareWith: values.shareWithEmails.trim() || undefined,
          dontShareWith: values.dontShareWithEmails.trim() || undefined,
          locationTag: values.locationTag || undefined,
        },
        postImageFile || undefined
      );
    },
  });

  const { values, errors } = formik;
  const customError = errors.shareWithEmails || errors.dontShareWithEmails;

  if (!isOpen) return null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type.toLowerCase())) {
        setImageError('Choose a JPG, PNG, or WebP image.');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setImageError('The image must be 10 MB or smaller.');
        return;
      }
      setImageError(null);
      setPostImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
              <Button className="mhn-modal-close-btn" onClick={onClose} aria-label="Close modal">
                <X size={18} aria-hidden="true" />
              </Button>
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
                <Button
                  type="button"
                  className="mhn-audience-pill"
                  onClick={() => {
                    setTempAudience(values.audience);
                    setScreen('audience');
                  }}
                >
                  <span>{values.audience}</span>
                  <ChevronDown size={12} aria-hidden="true" />
                </Button>
              </div>
            </div>

            {/* Post Textarea Content */}
            <form onSubmit={formik.handleSubmit} className="mhn-modal-form" noValidate>
              <Textarea
                className="mhn-modal-textarea"
                placeholder="What do you want to talk about?"
                name="content"
                value={values.content}
                onChange={formik.handleChange}
                rows={5}
                autoFocus
              />

              {/* Attached Image Preview */}
              {postImage && (
                <div className="mhn-modal-image-preview-wrapper">
                  <img src={postImage} alt="Post preview" className="mhn-modal-image-preview" />
                  <Button
                    type="button"
                    className="mhn-modal-remove-img-btn"
                    onClick={() => {
                      setPostImage(null);
                      setPostImageFile(null);
                      setImageError(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <X size={14} aria-hidden="true" />
                  </Button>
                </div>
              )}

              {/* Attached Location Tag */}
              {values.locationTag && (
                <div className="mhn-modal-location-tag">
                  <MapPin size={14} aria-hidden="true" />
                  <span>{values.locationTag}</span>
                  <Button type="button" onClick={() => void formik.setFieldValue('locationTag', '')}>×</Button>
                </div>
              )}

              {/* Hidden File Input */}
              <Input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/jpeg,image/png,image/webp"
                className="mhn-display-none"
              />

              {imageError && <p className="mhn-edit-profile-field-error">{imageError}</p>}

              {/* Action Toolbar */}
              <div className="mhn-modal-toolbar">
                <div className="mhn-modal-toolbar-actions">
                  {/* Photo Icon Button */}
                  <Button
                    type="button"
                    className="mhn-modal-icon-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Add photo"
                  >
                    <Image size={22} aria-hidden="true" />
                  </Button>

                  {/* Location Icon Button */}
                  <Button
                    type="button"
                    className="mhn-modal-icon-btn"
                    onClick={() => void formik.setFieldValue('locationTag', values.locationTag ? '' : 'Austria, Europe')}
                    title="Add location"
                  >
                    <MapPin size={20} aria-hidden="true" />
                  </Button>
                </div>
              </div>

              {/* Submit Post Button */}
              <div className="mhn-modal-submit-row">
                <Button
                  type="submit"
                  disabled={(!values.content.trim() && !postImage) || isLoading}
                  className={`mhn-modal-submit-btn ${(values.content.trim() || postImage) && !isLoading ? 'active' : 'disabled'}`}
                >
                  {isLoading ? (
                    <span className="mhn-btn-loading-flex">
                      <LoaderCircle className="mhn-spin" size={16} aria-hidden="true" />
                      Posting...
                    </span>
                  ) : (
                    'Post'
                  )}
                </Button>
              </div>
            </form>
          </>
        )}

        {/* ==================== SCREEN 2: POST AUDIENCE ==================== */}
        {screen === 'audience' && (
          <>
            <div className="mhn-modal-header-nav">
              <Button
                type="button"
                className="mhn-modal-nav-btn"
                onClick={() => setScreen('create')}
                aria-label="Back"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </Button>
              <h2 className="mhn-modal-title">Post Audience</h2>
              <Button
                type="button"
                className="mhn-modal-nav-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} aria-hidden="true" />
              </Button>
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
                  <Input
                    type="radio"
                    name="audienceOpt"
                    checked={tempAudience === 'Everyone'}
                    onChange={() => handleAudienceOptionClick('Everyone')}
                    className="mhn-radio-input"
                  />
                </label>

                <label className="mhn-audience-option-row" onClick={() => handleAudienceOptionClick('Groups')}>
                  <span>Groups</span>
                  <Input
                    type="radio"
                    name="audienceOpt"
                    checked={tempAudience === 'Groups'}
                    onChange={() => handleAudienceOptionClick('Groups')}
                    className="mhn-radio-input"
                  />
                </label>

                <label className="mhn-audience-option-row" onClick={() => handleAudienceOptionClick('Custom')}>
                  <span>Custom</span>
                  <Input
                    type="radio"
                    name="audienceOpt"
                    checked={tempAudience === 'Custom'}
                    onChange={() => handleAudienceOptionClick('Custom')}
                    className="mhn-radio-input"
                  />
                </label>
              </div>

              <Button
                type="button"
                className="mhn-audience-footer-btn"
                onClick={() => {
                  void formik.setFieldValue('audience', tempAudience);
                  if (tempAudience !== 'Custom') {
                    void formik.setFieldValue('shareWithEmails', '');
                    void formik.setFieldValue('dontShareWithEmails', '');
                  }
                  setScreen('create');
                }}
              >
                Done
              </Button>
            </div>
          </>
        )}

        {/* ==================== SCREEN 3: CUSTOM PRIVACY ==================== */}
        {screen === 'custom' && (
          <>
            <div className="mhn-modal-header-nav">
              <Button
                type="button"
                className="mhn-modal-nav-btn"
                onClick={() => setScreen('audience')}
                aria-label="Back"
              >
                <ChevronLeft size={18} aria-hidden="true" />
              </Button>
              <h2 className="mhn-modal-title">Custom privacy</h2>
              <Button
                type="button"
                className="mhn-modal-nav-btn"
                onClick={onClose}
                aria-label="Close"
              >
                <X size={18} aria-hidden="true" />
              </Button>
            </div>

            <div className="mhn-custom-privacy-body">
              {/* Share with */}
              <div className="mhn-custom-field-group">
                <h3 className="mhn-custom-field-label">Share with</h3>
                <Textarea
                  className="mhn-custom-textarea"
                  placeholder="Type mail of the users (e.g. user@example.com)"
                  name="shareWithEmails"
                  value={values.shareWithEmails}
                  onChange={formik.handleChange}
                  rows={3}
                />
              </div>

              {/* Don't share with */}
              <div className="mhn-custom-field-group">
                <h3 className="mhn-custom-field-label">Don't share with</h3>
                <Textarea
                  className="mhn-custom-textarea"
                  placeholder="Type mail of the users (e.g. user@example.com)"
                  name="dontShareWithEmails"
                  value={values.dontShareWithEmails}
                  onChange={formik.handleChange}
                  rows={3}
                />
              </div>

              {customError && (
                <div className="mhn-edit-profile-field-error mhn-mb-12">
                  <span>⚠️</span>
                  <span>{customError}</span>
                </div>
              )}

              {/* Footnote note */}
              <p className="mhn-custom-footnote">
                Anyone you include here or have on your restricted list won't be able to see this post unless you tag them. We don't let people know when you choose not to share something with them.
              </p>

              {/* Actions row */}
              <div className="mhn-custom-actions-row">
                <Button
                  type="button"
                  className="mhn-btn-custom-cancel"
                  onClick={() => {
                    setScreen('audience');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="mhn-btn-custom-done"
                  onClick={async () => {
                    const validationErrors = await formik.validateForm();
                    if (validationErrors.shareWithEmails || validationErrors.dontShareWithEmails) return;
                    await formik.setFieldValue('audience', 'Custom');
                    setScreen('create');
                  }}
                >
                  Done
                </Button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
};
