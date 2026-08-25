import React from 'react';
import { Input, Dropdown, FormField } from '../../common/FormControls';

export interface PersonalDetailsData {
  city: string;
  dateOfBirth: string;
  genderCategory: string;
}

export interface PersonalDetailsFieldsProps {
  values: PersonalDetailsData;
  onChange: (field: keyof PersonalDetailsData, value: string) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
];

function formatIsoDate(rawDob?: string | null): string {
  if (!rawDob) return '';
  const str = String(rawDob).trim();
  if (str.includes('T')) {
    return str.split('T')[0];
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }
  const dateObj = new Date(str);
  if (!isNaN(dateObj.getTime())) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
}

export const PersonalDetailsFields: React.FC<PersonalDetailsFieldsProps> = ({
  values,
  onChange,
  errors = {},
  disabled = false,
}) => {
  return (
    <div className="mhn-personal-details-fields mhn-col-flex-gap-20">
      {/* Location / City */}
      <FormField label="Location (City)" error={errors.city} maxLength={50} valueLength={values.city?.length}>
        <Input
          type="text"
          value={values.city}
          onChange={(e) => onChange('city', e.target.value)}
          disabled={disabled}
          maxLength={50}
          className={`mhn-about-input-box ${errors.city || (values.city && values.city.length >= 50) ? 'mhn-edit-profile-input-error' : ''}`}
          placeholder="e.g. Toronto, ON"
        />
      </FormField>

      {/* Date of Birth */}
      <FormField label="Date of Birth" error={errors.dateOfBirth}>
        <Input
          type="date"
          value={formatIsoDate(values.dateOfBirth)}
          onChange={(e) => onChange('dateOfBirth', e.target.value)}
          disabled={disabled}
          className={`mhn-about-input-box ${errors.dateOfBirth ? 'mhn-edit-profile-input-error' : ''}`}
        />
      </FormField>

      {/* Gender Category */}
      <Dropdown
        label="Gender"
        value={values.genderCategory || 'Male'}
        options={GENDER_OPTIONS}
        onChange={(val) => onChange('genderCategory', val)}
        disabled={disabled}
        error={errors.genderCategory}
        placeholder="Select gender"
      />
    </div>
  );
};
