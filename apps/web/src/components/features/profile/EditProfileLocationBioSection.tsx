import { FormInput, FormTextarea } from '@/components/form/fields';
import type { EditProfileFormValues } from '@my-hockey-network/validation';

export interface EditProfileLocationBioSectionProps {
  bioLength: number;
}

/** Edit Profile modal's city/location + bio fields. Extracted from
 * `EditProfileModal.tsx`. */
export function EditProfileLocationBioSection({ bioLength }: Readonly<EditProfileLocationBioSectionProps>) {
  return (
    <div className="mhn-mb-24">
      <FormInput<EditProfileFormValues, 'city'> name="city" label="City / Location" maxLength={50} placeholder="e.g. Toronto, ON or Austria, Europe" inputClassName="mhn-edit-profile-input" containerClassName="mhn-mt-16" errorClassName="mhn-edit-profile-field-error" disableAutoSanitize />

      <div className="mhn-mt-16">
        <FormTextarea<EditProfileFormValues, 'bio'>
          name="bio"
          label="Player Bio"
          placeholder="Write a brief intro about your hockey background and goals..."
          rows={3}
          textareaClassName="mhn-edit-profile-input mhn-bio-textarea"
          errorClassName="mhn-edit-profile-field-error"
        />
        <div className="mhn-toggle-row-between">
          <div />
          <span className="mhn-edit-profile-char-count">{bioLength} / 300</span>
        </div>
      </div>
    </div>
  );
}
