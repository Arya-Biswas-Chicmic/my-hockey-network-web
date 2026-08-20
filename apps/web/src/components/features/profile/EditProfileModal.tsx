import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Spinner } from '../../common/Spinner';
import { uploadMediaFile } from '@my-hockey-network/core';
import { resolveMediaUrl } from '../../../utils/mediaUtils';

export interface EditProfileFormData {
  firstName: string;
  lastName: string;
  displayName: string;
  phone: string;
  bio: string;
  city: string;
  dateOfBirth: string;
  position: string;
  shootsCatches: string;
  jerseyNumber: string;
  genderCategory: string;
  preferredLanguage: string;
  defaultVisibility: string;
  avatarUrl: string;
  avatarKey?: string;
}

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (updatedData: EditProfileFormData) => Promise<void> | void;
}

const POSITION_OPTIONS = [
  { value: 'Center', label: 'Center (C)' },
  { value: 'Left Wing', label: 'Left Wing (LW)' },
  { value: 'Right Wing', label: 'Right Wing (RW)' },
  { value: 'Defense', label: 'Defense (D)' },
  { value: 'Goaltender', label: 'Goaltender (G)' },
];

const SHOOTS_OPTIONS = [
  { value: 'Left', label: 'Left (L)' },
  { value: 'Right', label: 'Right (R)' },
];

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-Binary', label: 'Non-Binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English (US)' },
  { value: 'en-GB', label: 'English (UK)' },
  { value: 'fr', label: 'French (Français)' },
  { value: 'de', label: 'German (Deutsch)' },
  { value: 'nl', label: 'Dutch (Nederlands)' },
  { value: 'sv', label: 'Swedish (Svenska)' },
];

const VISIBILITY_OPTIONS = [
  { value: 'EVERYONE', label: 'Everyone (Public)' },
  { value: 'CONNECTIONS', label: 'Connections Only' },
  { value: 'PRIVATE', label: 'Private (Only Me)' },
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null);

  const extractInitialValues = (): EditProfileFormData => {
    const prof = user?.profile;
    let dobFormatted = '';
    if (prof?.dateOfBirth) {
      try {
        dobFormatted = new Date(prof?.dateOfBirth).toISOString().split('T')[0];
      } catch {
        dobFormatted = String(prof?.dateOfBirth);
      }
    }

    return {
      firstName: prof?.firstName || '',
      lastName: prof?.lastName || '',
      displayName: prof?.displayName || (user as any)?.displayName || '',
      phone: user?.phone || '',
      bio: prof?.bio || '',
      city: prof?.city || '',
      dateOfBirth: dobFormatted,
      position: prof?.position || 'Center',
      shootsCatches: prof?.shootsCatches || 'Left',
      jerseyNumber: prof?.jerseyNumber !== null && prof?.jerseyNumber !== undefined ? String(prof?.jerseyNumber) : '',
      genderCategory: prof?.genderCategory || 'Male',
      preferredLanguage: prof?.preferredLanguage || 'en',
      defaultVisibility: prof?.defaultVisibility || 'CONNECTIONS',
      avatarUrl: resolveMediaUrl(prof?.avatarUrl, '/userPlaceholder.png'),
    };
  };

  const [initialForm, setInitialForm] = useState<EditProfileFormData>(extractInitialValues);
  const [formData, setFormData] = useState<EditProfileFormData>(extractInitialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync form data whenever modal opens or user object updates
  useEffect(() => {
    if (isOpen) {
      const init = extractInitialValues();
      setInitialForm(init);
      setFormData(init);
      setErrors({});
      setSaveSuccessMsg(null);
      setShowDiscardConfirm(false);
      setSelectedAvatarFile(null);
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const userEmail = user?.email || 'saksham.garg@chicmicstudios.in';
  const userPrimaryRole = user?.primaryRole || user?.profile?.type || 'PLAYER';

  // Compute dirty state
  const isFormDirty = JSON.stringify(initialForm) !== JSON.stringify(formData) || !!selectedAvatarFile;

  const validateField = (name: keyof EditProfileFormData, value: string): string | null => {
    if (name === 'displayName') {
      if (!value.trim()) return 'Display Name is required.';
      if (value.trim().length < 2) return 'Display Name must be at least 2 characters.';
    }
    if (name === 'jerseyNumber' && value.trim()) {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 99 || !Number.isInteger(num)) {
        return 'Jersey Number must be an integer between 0 and 99.';
      }
    }
    if (name === 'phone' && value.trim()) {
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
      if (!phoneRegex.test(value.trim())) {
        return 'Please enter a valid phone number.';
      }
    }
    return null;
  };

  const handleChange = (field: keyof EditProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const err = validateField(field, value);
    setErrors((prev) => {
      const updated = { ...prev };
      if (err) {
        updated[field] = err;
      } else {
        delete updated[field];
      }
      return updated;
    });
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate MIME type as per media-uploads.md: jpeg, png, webp (max 10MB)
      const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!validMimeTypes.includes(file.type.toLowerCase())) {
        setErrors((prev) => ({
          ...prev,
          form: 'Unsupported image format. Please select a JPG, PNG, or WebP photo (HEIC/SVG/GIF not supported).',
        }));
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          form: 'File size exceeds 10 MB limit. Please select a smaller photo.',
        }));
        return;
      }

      setSelectedAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      handleChange('avatarUrl', previewUrl);
    }
  };

  const handleAttemptClose = () => {
    if (isFormDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submitting
    const newErrors: Record<string, string> = {};
    (Object.keys(formData) as Array<keyof EditProfileFormData>).forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    let uploadedAvatarKey: string | undefined = undefined;

    // Step 1 & 2: If user selected a new photo file, request upload slot and upload raw bytes to storage
    if (selectedAvatarFile) {
      try {
        console.log('🚀 [EditProfileModal] Step 1: Requesting upload slot (POST /v1/media/upload-url, purpose: AVATAR)...');
        console.log('🚀 [EditProfileModal] Step 2: Uploading file bytes straight to storage via PUT...');
        const uploadRes = await uploadMediaFile(selectedAvatarFile, 'AVATAR');
        uploadedAvatarKey = uploadRes.storageKey;
        console.log('✅ [EditProfileModal] Step 1 & 2 completed successfully. storageKey:', uploadedAvatarKey);
      } catch (uploadErr: any) {
        console.error('❌ [EditProfileModal] Avatar Storage Upload Failed:', uploadErr);
        setErrors({ form: uploadErr.message || 'Failed to upload photo to storage. Please try again.' });
        setIsSubmitting(false);
        return;
      }
    }

    // Step 3: Save profile changes (PATCH /v1/auth/profile) sending avatarKey
    try {
      if (onSave) {
        await onSave({
          ...formData,
          avatarKey: uploadedAvatarKey,
        });
      }
      setSaveSuccessMsg('Profile updated successfully!');
      setInitialForm({
        ...formData,
        avatarKey: uploadedAvatarKey,
      });
      setSelectedAvatarFile(null);
      setTimeout(() => {
        setSaveSuccessMsg(null);
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to update profile. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasValidationErrors = Object.keys(errors).length > 0;
  const isSaveDisabled = !isFormDirty || hasValidationErrors || isSubmitting;

  return (
    <div
      className="mhn-modal-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleAttemptClose();
      }}
    >
      <div
        className="mhn-edit-profile-modal-card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          animation: 'modalSlideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#F8FAFC',
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A', margin: 0 }}>
              Edit Profile
            </h2>
            <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
              Update your personal details, player stats, and account preferences.
            </p>
          </div>

          <button
            onClick={handleAttemptClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {saveSuccessMsg && (
            <div
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                color: '#166534',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>✓</span>
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {errors.form && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '20px',
              }}
            >
              {errors.form}
            </div>
          )}

          {/* Section 1: Read-Only System Account Badges */}
          <div
            style={{
              backgroundColor: '#F1F5F9',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '24px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Email (Read-only + Verified Badge) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Email Address
                </label>
                <span
                  style={{
                    backgroundColor: '#DCFCE7',
                    color: '#15803D',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  ✓ Verified
                </span>
              </div>
              <input
                type="text"
                value={userEmail}
                disabled
                readOnly
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: '#E2E8F0',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '0 12px',
                  fontSize: '14px',
                  color: '#64748B',
                  cursor: 'not-allowed',
                  fontWeight: 500,
                }}
              />
            </div>

            {/* Primary Role (Read-only PLAYER Badge) */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '6px' }}>
                Primary Account Role
              </label>
              <div
                style={{
                  width: '100%',
                  height: '42px',
                  backgroundColor: '#E2E8F0',
                  border: '1px solid #CBD5E1',
                  borderRadius: '8px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '14px',
                  cursor: 'not-allowed',
                }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#1860C3' }} />
                <span>{userPrimaryRole}</span>
                <span style={{ fontSize: '11px', color: '#94A3B8', marginLeft: 'auto' }}>(Primary Role Locked)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Avatar Upload & Identity */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              Personal Identity
            </h3>

            {/* Avatar Row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <img
                  src={formData.avatarUrl}
                  alt="Profile Avatar"
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid #1860C3',
                    backgroundColor: '#F1F5F9',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/userPlaceholder.png';
                  }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '0',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#1860C3',
                    color: '#FFFFFF',
                    border: '2px solid #FFFFFF',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Upload profile photo"
                >
                  ✎
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarFileChange}
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#1E293B',
                    cursor: 'pointer',
                    marginRight: '8px',
                  }}
                >
                  Upload Photo
                </button>
                {formData.avatarUrl !== '/userPlaceholder.png' && (
                  <button
                    type="button"
                    onClick={() => handleChange('avatarUrl', '/userPlaceholder.png')}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#DC2626',
                      cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                )}
                <p style={{ fontSize: '12px', color: '#64748B', margin: '6px 0 0 0' }}>
                  Allowed JPG, PNG or WebP. Max 5MB.
                </p>
              </div>
            </div>

            {/* Display Name, First Name, Last Name Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Display Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => handleChange('displayName', e.target.value)}
                  placeholder="e.g. Saksham Garg"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: errors.displayName ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {errors.displayName && (
                  <span style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                    {errors.displayName}
                  </span>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="e.g. Saksham"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="e.g. Garg"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Date of Birth, Gender, Phone Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Gender Category
                </label>
                <select
                  value={formData.genderCategory}
                  onChange={(e) => handleChange('genderCategory', e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {GENDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: errors.phone ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {errors.phone && (
                  <span style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                    {errors.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 3: Player Athletic & Hockey Details */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '8px' }}>
              Player & Athletic Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Position
                </label>
                <select
                  value={formData.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {POSITION_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Shoots / Catches
                </label>
                <select
                  value={formData.shootsCatches}
                  onChange={(e) => handleChange('shootsCatches', e.target.value)}
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {SHOOTS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Jersey Number (#)
                </label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={formData.jerseyNumber}
                  onChange={(e) => handleChange('jerseyNumber', e.target.value)}
                  placeholder="e.g. 97"
                  style={{
                    width: '100%',
                    height: '44px',
                    borderRadius: '8px',
                    border: errors.jerseyNumber ? '1px solid #DC2626' : '1px solid #CBD5E1',
                    padding: '0 12px',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
                {errors.jerseyNumber && (
                  <span style={{ fontSize: '12px', color: '#DC2626', marginTop: '4px', display: 'block' }}>
                    {errors.jerseyNumber}
                  </span>
                )}
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                City / Location
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                placeholder="e.g. Toronto, ON or Austria, Europe"
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  padding: '0 12px',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Player Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleChange('bio', e.target.value)}
                placeholder="Write a brief intro about your hockey background and goals..."
                rows={3}
                style={{
                  width: '100%',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  padding: '10px 12px',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span style={{ fontSize: '13px', color: isFormDirty ? '#1E293B' : '#94A3B8', fontWeight: 500 }}>
            {isFormDirty ? '● Unsaved changes' : 'No changes made'}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              onClick={handleAttemptClose}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #CBD5E1',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaveDisabled}
              style={{
                backgroundColor: isSaveDisabled ? '#94A3B8' : '#1860C3',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 600,
                color: '#FFFFFF',
                cursor: isSaveDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease-in-out',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" color="#FFFFFF" />
                  <span>Saving...</span>
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Discard Unsaved Changes Dialog */}
      {showDiscardConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '100%',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
            }}
          >
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px 0' }}>
              Discard Unsaved Changes?
            </h3>
            <p style={{ fontSize: '14px', color: '#64748B', margin: '0 0 20px 0', lineHeight: 1.4 }}>
              You have unsaved edits in your profile. Are you sure you want to discard them?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => setShowDiscardConfirm(false)}
                style={{
                  backgroundColor: '#F1F5F9',
                  border: '1px solid #CBD5E1',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer',
                }}
              >
                Keep Editing
              </button>
              <button
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onClose();
                }}
                style={{
                  backgroundColor: '#DC2626',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  cursor: 'pointer',
                }}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
