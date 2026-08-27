import { FormInput, FormSelect } from '@/components/form/fields';
import { POSITION_OPTIONS, SHOOTS_OPTIONS } from '@/config/profile-options';
import { useReferenceData } from '@/hooks/use-reference-data';
import type { EditProfileFormValues } from '@my-hockey-network/validation';

/** Edit Profile modal's "Player & Athletic Information" section — only
 * rendered for players. Extracted from `EditProfileModal.tsx`. Fetches its
 * own reference-data position list (falling back to the static default set)
 * rather than taking it as a prop, since it's the only section that needs it. */
export function EditProfileAthleticSection() {
  const { positions: refPositions } = useReferenceData();
  const positionOptions = refPositions.length ? refPositions : POSITION_OPTIONS;

  return (
    <div className="mhn-mb-24">
      <h3 className="mhn-section-heading">Player &amp; Athletic Information</h3>

      <div className="mhn-edit-profile-system-banner">
        <FormSelect<EditProfileFormValues, 'position'>
          name="position"
          label="Position"
          options={[...positionOptions]}
          selectClassName="mhn-edit-profile-input"
          containerClassName=""
        />

        <FormSelect<EditProfileFormValues, 'shootsCatches'>
          name="shootsCatches"
          label="Shoots / Catches"
          options={SHOOTS_OPTIONS}
          selectClassName="mhn-edit-profile-input"
          containerClassName=""
        />

        <FormInput<EditProfileFormValues, 'jerseyNumber'> name="jerseyNumber" label="Jersey Number (#)" type="number" min="0" max="99" placeholder="e.g. 97" inputClassName="mhn-edit-profile-input" containerClassName="" errorClassName="mhn-edit-profile-field-error" disableAutoSanitize />
      </div>
    </div>
  );
}
