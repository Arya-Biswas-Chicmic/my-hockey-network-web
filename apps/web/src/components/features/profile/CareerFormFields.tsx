import React from 'react';
import { useFormikContext, Field } from 'formik';
import { Input, Textarea, Dropdown, FormField } from '@/components/common/FormControls';
import { FormError } from '@/components/common/form/FormError';
import { useReferenceData } from '@/hooks/use-reference-data';
import { CareerFormValues } from '@my-hockey-network/validation';

export type CareerFormData = CareerFormValues;

export interface CareerFormFieldsProps {
  values?: CareerFormData;
  onChange?: <K extends keyof CareerFormData>(field: K, value: CareerFormData[K]) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

const POSITION_OPTIONS = [
  { value: 'Center', label: 'Center' },
  { value: 'Left Wing', label: 'Left Wing' },
  { value: 'Right Wing', label: 'Right Wing' },
  { value: 'Defense', label: 'Defense' },
  { value: 'Goaltender', label: 'Goaltender' },
];

const MONTH_OPTIONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const YEAR_OPTIONS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', '2010'];

export const CareerFormFields: React.FC<CareerFormFieldsProps> = ({
  values: propsValues,
  onChange: propsOnChange,
  errors: propsErrors = {},
  disabled = false,
}) => {
  const { positions: refPositions } = useReferenceData();
  const positionOptions = refPositions.length ? refPositions : POSITION_OPTIONS;

  // Consume Formik context if rendered inside Formik container
  const formik = useFormikContext<CareerFormData>();

  const values = formik ? formik.values : (propsValues || {
    teamName: '',
    position: '',
    location: '',
    isCurrentPlaying: false,
    startMonth: '',
    startYear: '',
    endMonth: '',
    endYear: '',
    note: '',
  });

  const getFieldError = (name: keyof CareerFormData): string | undefined => {
    if (formik) {
      const touched = formik.touched[name];
      const err = formik.errors[name];
      return touched && err ? String(err) : undefined;
    }
    return propsErrors[name];
  };

  const handleFieldChange = <K extends keyof CareerFormData>(field: K, value: CareerFormData[K]) => {
    if (formik) {
      formik.setFieldValue(field, value);
      formik.setFieldTouched(field, true, true);
    }
    if (propsOnChange) {
      propsOnChange(field, value);
    }
  };

  return (
    <div className="mhn-career-form-fields mhn-col-flex-gap-16">
      {/* Team Input */}
      <FormField label="Team" required error={getFieldError('teamName')} maxLength={50} valueLength={values.teamName?.length}>
        <Input
          type="text"
          value={values.teamName}
          onChange={(e) => handleFieldChange('teamName', e.target.value)}
          disabled={disabled}
          maxLength={50}
          placeholder="Team name"
          className={`mhn-about-input-box ${getFieldError('teamName') || (values.teamName && values.teamName.length >= 50) ? 'mhn-edit-profile-input-error' : ''}`}
        />
      </FormField>

      {/* Position Dropdown */}
      <Dropdown
        label="Position"
        required
        value={values.position}
        options={positionOptions}
        onChange={(val) => handleFieldChange('position', val)}
        disabled={disabled}
        error={getFieldError('position')}
        placeholder="Select"
      />

      {/* City/Town Input */}
      <FormField label="City/Town" required error={getFieldError('location')} maxLength={50} valueLength={values.location?.length}>
        <Input
          type="text"
          value={values.location}
          onChange={(e) => handleFieldChange('location', e.target.value)}
          disabled={disabled}
          maxLength={50}
          placeholder="e.g. Toronto, Canada"
          className={`mhn-about-input-box ${getFieldError('location') || (values.location && values.location.length >= 50) ? 'mhn-edit-profile-input-error' : ''}`}
        />
      </FormField>

      {/* Checkbox: Currently playing here */}
      <label className="mhn-checkbox-label-row">
        <Input
          type="checkbox"
          checked={values.isCurrentPlaying || false}
          onChange={(e) => handleFieldChange('isCurrentPlaying', e.target.checked)}
          disabled={disabled}
          className="mhn-checkbox-accent"
        />
        <span>I currently playing here</span>
      </label>

      {/* Start Date: Month + Year side-by-side */}
      <FormField label="Start date" required>
        <div className="mhn-grid-2col-gap-12">
          <Dropdown
            value={values.startMonth}
            options={MONTH_OPTIONS}
            onChange={(val) => handleFieldChange('startMonth', val)}
            disabled={disabled}
            placeholder="Month"
            error={getFieldError('startMonth')}
          />
          <Dropdown
            value={values.startYear}
            options={YEAR_OPTIONS}
            onChange={(val) => handleFieldChange('startYear', val)}
            disabled={disabled}
            placeholder="Year"
            error={getFieldError('startYear')}
          />
        </div>
      </FormField>

      {/* End Date (if !isCurrentPlaying) */}
      {!values.isCurrentPlaying && (
        <FormField label="End date" required>
          <div className="mhn-grid-2col-gap-12">
            <Dropdown
              value={values.endMonth || ''}
              options={MONTH_OPTIONS}
              onChange={(val) => handleFieldChange('endMonth', val)}
              disabled={disabled}
              placeholder="Month"
              error={getFieldError('endMonth')}
            />
            <Dropdown
              value={values.endYear || ''}
              options={YEAR_OPTIONS}
              onChange={(val) => handleFieldChange('endYear', val)}
              disabled={disabled}
              placeholder="Year"
              error={getFieldError('endYear')}
            />
          </div>
        </FormField>
      )}

      {/* Description Textarea */}
      <FormField label="Description" error={getFieldError('note')}>
        <Textarea
          rows={3}
          value={values.note || ''}
          onChange={(e) => handleFieldChange('note', e.target.value)}
          disabled={disabled}
          placeholder="Tell us about it"
          className={`mhn-about-input-box ${getFieldError('note') ? 'mhn-edit-profile-input-error' : ''}`}
        />
      </FormField>
    </div>
  );
};
