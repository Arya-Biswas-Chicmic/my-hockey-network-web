import { Button } from '@/components/common/Button';
import { Input, Textarea } from '@/components/common/FormControls';
import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { resolveMediaUrl } from '@/utils/mediaUtils';
import { createFileSchema, createPostFormSchema, IMAGE_ACCEPT, IMAGE_MIME_TYPES, type CreatePostFormValues } from '@my-hockey-network/validation';
import { CreatePostAudienceEnum } from '@my-hockey-network/contracts';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { ChevronDown, ChevronLeft, Image as ImageIcon, LoaderCircle, MapPin, X } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { FilePickerButton } from '@/components/ui/file-picker-button';
import { FallbackImage } from '@/components/ui/fallback-image';

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
  const resolvedName = user?.profile?.displayName || userName || 'Player';
  const rawAvatar = user?.profile?.avatarUrl || userAvatar;
  const resolvedAvatar = resolveMediaUrl(rawAvatar, '/userPlaceholder.png');

  const [screen, setScreen] = useState<'create' | 'audience' | 'custom'>('create');
  const [tempAudience, setTempAudience] = useState<CreatePostAudienceEnum>(CreatePostAudienceEnum.EVERYONE);
  const [postImage, setPostImage] = useState<string | null>(null);
  const [postImageFile, setPostImageFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const form = useForm<CreatePostFormValues>({
    resolver: zodResolver(createPostFormSchema),
    mode: 'onChange',
    defaultValues: {
      content: '',
      audience: CreatePostAudienceEnum.EVERYONE,
      shareWithEmails: '',
      dontShareWithEmails: '',
      locationTag: '',
    },
  });
  const handleSubmit = form.handleSubmit((values) => {
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
  });
  const watchedValues = useWatch({ control: form.control });
  const values = {
    content: watchedValues.content ?? '',
    audience: watchedValues.audience ?? CreatePostAudienceEnum.EVERYONE,
    locationTag: watchedValues.locationTag ?? '',
  };
  const customError = form.formState.errors.shareWithEmails?.message || form.formState.errors.dontShareWithEmails?.message;

  if (!isOpen) return null;

  const handleImageSelect = (files: File[]) => {
    const file = files[0];
    if (file) {
      const result = createFileSchema({ acceptedTypes: IMAGE_MIME_TYPES, maxBytes: 10 * 1024 * 1024 }).safeParse(file);
      if (!result.success) {
        setImageError(result.error.issues[0]?.message ?? 'Choose a JPG, PNG, or WebP image up to 10 MB.');
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

  const handleAudienceOptionClick = (opt: CreatePostAudienceEnum) => {
    setTempAudience(opt);
    if (opt === CreatePostAudienceEnum.CUSTOM) {
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
              <FallbackImage
                src={resolvedAvatar}
                alt={resolvedName}
                width={44}
                height={44}
                className="mhn-modal-user-avatar"
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
            <Form methods={form} onSubmit={handleSubmit} className="mhn-modal-form" noValidate>
              <Textarea
                className="mhn-modal-textarea"
                placeholder="What do you want to talk about?"
                {...form.register('content')}
                rows={5}
                autoFocus
              />

              {/* Attached Image Preview */}
              {postImage && (
                <div className="mhn-modal-image-preview-wrapper">
                  {/* Local data: URI preview before upload — not a Next-optimizable remote asset. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={postImage} alt="Post preview" className="mhn-modal-image-preview" />
                  <Button
                    type="button"
                    className="mhn-modal-remove-img-btn"
                    onClick={() => {
                      setPostImage(null);
                      setPostImageFile(null);
                      setImageError(null);
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
                  <Button type="button" onClick={() => form.setValue('locationTag', '')}>×</Button>
                </div>
              )}

              {imageError && <p className="mhn-edit-profile-field-error">{imageError}</p>}

              {/* Action Toolbar */}
              <div className="mhn-modal-toolbar">
                <div className="mhn-modal-toolbar-actions">
                  {/* Photo Icon Button */}
                  <FilePickerButton
                    accept={IMAGE_ACCEPT}
                    onFilesSelected={handleImageSelect}
                    buttonProps={{ className: 'mhn-modal-icon-btn', title: 'Add photo', 'aria-label': 'Add photo' }}
                  >
                    <ImageIcon size={22} aria-hidden="true" />
                  </FilePickerButton>

                  {/* Location Icon Button */}
                  <Button
                    type="button"
                    className="mhn-modal-icon-btn"
                    onClick={() => form.setValue('locationTag', values.locationTag ? '' : 'Austria, Europe')}
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
            </Form>
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
                <label className="mhn-audience-option-row">
                  <span>Everyone</span>
                  <Input
                    type="radio"
                    name="audienceOpt"
                    checked={tempAudience === CreatePostAudienceEnum.EVERYONE}
                    onChange={() => handleAudienceOptionClick(CreatePostAudienceEnum.EVERYONE)}
                    className="mhn-radio-input"
                  />
                </label>

                <label className="mhn-audience-option-row">
                  <span>Groups</span>
                  <Input
                    type="radio"
                    name="audienceOpt"
                    checked={tempAudience === CreatePostAudienceEnum.GROUPS}
                    onChange={() => handleAudienceOptionClick(CreatePostAudienceEnum.GROUPS)}
                    className="mhn-radio-input"
                  />
                </label>

                <label className="mhn-audience-option-row">
                  <span>Custom</span>
                  <Input
                    type="radio"
                    name="audienceOpt"
                    checked={tempAudience === CreatePostAudienceEnum.CUSTOM}
                    onChange={() => handleAudienceOptionClick(CreatePostAudienceEnum.CUSTOM)}
                    className="mhn-radio-input"
                  />
                </label>
              </div>

              <Button
                type="button"
                className="mhn-audience-footer-btn"
                onClick={() => {
                  form.setValue('audience', tempAudience);
                  if (tempAudience !== CreatePostAudienceEnum.CUSTOM) {
                    form.setValue('shareWithEmails', '');
                    form.setValue('dontShareWithEmails', '');
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
                  {...form.register('shareWithEmails')}
                  rows={3}
                />
              </div>

              {/* Don't share with */}
              <div className="mhn-custom-field-group">
                <h3 className="mhn-custom-field-label">Don&apos;t share with</h3>
                <Textarea
                  className="mhn-custom-textarea"
                  placeholder="Type mail of the users (e.g. user@example.com)"
                  {...form.register('dontShareWithEmails')}
                  rows={3}
                />
              </div>

              {customError && (
                <div className="mhn-edit-profile-field-error mhn-mb-12">
                  <span>{customError}</span>
                </div>
              )}

              {/* Footnote note */}
              <p className="mhn-custom-footnote">
                Anyone you include here or have on your restricted list won&apos;t be able to see this post unless you tag them. We don&apos;t let people know when you choose not to share something with them.
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
                    const valid = await form.trigger(['shareWithEmails', 'dontShareWithEmails']);
                    if (!valid) return;
                    form.setValue('audience', CreatePostAudienceEnum.CUSTOM);
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
