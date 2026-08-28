import { Button } from '@/components/common/Button';
import { FilePickerButton } from '@/components/ui/file-picker-button';
import { FormInput, FormSelect } from '@/components/form/fields';
import { GENDER_OPTIONS } from '@/config/profile-options';
import { IMAGE_ACCEPT, type EditProfileFormValues } from '@my-hockey-network/validation';

export interface EditProfileIdentitySectionProps {
  avatarUrl?: string;
  onAvatarFileChange: (files: File[]) => void;
  onRemoveAvatar: () => void;
}

/** Edit Profile modal's "Personal Identity" section: avatar upload/remove,
 * name fields, and date of birth/gender. Extracted from
 * `EditProfileModal.tsx`. Renders inside the modal's `<Form>` provider, so
 * the `FormInput`/`FormSelect` fields resolve their RHF context from there
 * rather than needing it threaded through props. */
export function EditProfileIdentitySection({ avatarUrl, onAvatarFileChange, onRemoveAvatar }: Readonly<EditProfileIdentitySectionProps>) {
  return (
    <div className="mhn-mb-24">
      <h3 className="mhn-section-heading">Personal Identity</h3>

      <div className="mhn-avatar-edit-row">
        <div className="mhn-relative-container">
          {/* `avatarUrl` may hold a local object: URL preview (selected but not yet
              uploaded) as well as a remote hosted URL — not a Next-optimizable
              remote asset in the preview case, so this stays a plain <img>. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatarUrl}
            alt="Profile Avatar"
            className="mhn-avatar-preview-img"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/userPlaceholder.webp';
            }}
          />
          <FilePickerButton
            accept={IMAGE_ACCEPT}
            onFilesSelected={onAvatarFileChange}
            buttonProps={{ className: 'mhn-avatar-pencil-badge', title: 'Upload profile photo', 'aria-label': 'Upload profile photo' }}
          >
            ✎
          </FilePickerButton>
        </div>

        <div>
          <FilePickerButton
            accept={IMAGE_ACCEPT}
            onFilesSelected={onAvatarFileChange}
            buttonProps={{ className: 'mhn-btn-upload-photo' }}
          >
            Upload Photo
          </FilePickerButton>
          {avatarUrl !== '/userPlaceholder.webp' && (
            <Button type="button" onClick={onRemoveAvatar} className="mhn-btn-remove-photo">
              Remove
            </Button>
          )}
          <p className="mhn-parent-card-sub-sm mhn-mt-6">Allowed JPG, PNG or WebP. Max 10MB.</p>
        </div>
      </div>

      <div className="mhn-edit-profile-system-banner">
        <FormInput<EditProfileFormValues, 'displayName'> name="displayName" label="Display Name" required maxLength={50} placeholder="e.g. Saksham Garg" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" isNameInput />
        <FormInput<EditProfileFormValues, 'firstName'> name="firstName" label="First Name" maxLength={50} placeholder="e.g. Saksham" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" isNameInput />
        <FormInput<EditProfileFormValues, 'lastName'> name="lastName" label="Last Name" maxLength={50} placeholder="e.g. Garg" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" isNameInput />
      </div>

      <div className="mhn-edit-profile-system-banner mhn-mt-16">
        <FormInput<EditProfileFormValues, 'dateOfBirth'> name="dateOfBirth" label="Date of Birth" type="date" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" />

        <FormSelect<EditProfileFormValues, 'genderCategory'>
          name="genderCategory"
          label="Gender Category"
          options={GENDER_OPTIONS}
          selectClassName="mhn-edit-profile-input"
          containerClassName=""
        />
      </div>
    </div>
  );
}
