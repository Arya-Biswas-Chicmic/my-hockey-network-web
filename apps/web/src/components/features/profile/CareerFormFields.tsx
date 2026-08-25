import React from 'react';
import { Input, Textarea, Dropdown, FormField } from '../../common/FormControls';
import { useReferenceData } from '../../../hooks/use-reference-data';

export interface CareerFormData {
  teamName: string;
  position: string;
  location: string;
  isCurrentPlaying: boolean;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  note: string;
}

export interface CareerFormFieldsProps {
  values: CareerFormData;
  onChange: <K extends keyof CareerFormData>(field: K, value: CareerFormData[K]) => void;
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
  values,
  onChange,
  errors = {},
  disabled = false,
}) => {
  const { positions: refPositions } = useReferenceData();
  const positionOptions = refPositions.length ? refPositions : POSITION_OPTIONS;

  return (
    <div className="mhn-career-form-fields" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Team Input */}
      <FormField label="Team" required error={errors.teamName} maxLength={50} valueLength={values.teamName?.length}>
        <Input
          type="text"
          value={values.teamName}
          onChange={(e) => onChange('teamName', e.target.value)}
          disabled={disabled}
          maxLength={50}
          placeholder="Team name"
          style={{
            width: '100%',
            height: '42px',
            borderRadius: '8px',
            border: (errors.teamName || (values.teamName && values.teamName.length >= 50)) ? '1px solid #DC2626' : '1px solid #CBD5E1',
            padding: '0 12px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </FormField>

      {/* Position Dropdown */}
      <Dropdown
        label="Position"
        required
        value={values.position}
        options={positionOptions}
        onChange={(val) => onChange('position', val)}
        disabled={disabled}
        error={errors.position}
        placeholder="Select"
      />

      {/* City/Town Input (Text Input with 50 char limit) */}
      <FormField label="City/Town" required error={errors.location} maxLength={50} valueLength={values.location?.length}>
        <Input
          type="text"
          value={values.location}
          onChange={(e) => onChange('location', e.target.value)}
          disabled={disabled}
          maxLength={50}
          placeholder="e.g. Toronto, Canada"
          style={{
            width: '100%',
            height: '42px',
            borderRadius: '8px',
            border: (errors.location || (values.location && values.location.length >= 50)) ? '1px solid #DC2626' : '1px solid #CBD5E1',
            padding: '0 12px',
            fontSize: '14px',
            outline: 'none',
          }}
        />
      </FormField>

      {/* Checkbox: Currently playing here */}
      <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
        <Input
          type="checkbox"
          checked={values.isCurrentPlaying}
          onChange={(e) => onChange('isCurrentPlaying', e.target.checked)}
          disabled={disabled}
          style={{ width: '16px', height: '16px', accentColor: '#1860C3', cursor: 'pointer' }}
        />
        <span>I currently playing here</span>
      </label>

      {/* Start Date: Month + Year side-by-side */}
      <FormField label="Start date" required>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Dropdown
            value={values.startMonth}
            options={MONTH_OPTIONS}
            onChange={(val) => onChange('startMonth', val)}
            disabled={disabled}
            placeholder="Month"
            error={errors.startMonth}
          />
          <Dropdown
            value={values.startYear}
            options={YEAR_OPTIONS}
            onChange={(val) => onChange('startYear', val)}
            disabled={disabled}
            placeholder="Year"
            error={errors.startYear}
          />
        </div>
      </FormField>

      {/* End Date (if !isCurrentPlaying) */}
      {!values.isCurrentPlaying && (
        <FormField label="End date" required>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Dropdown
              value={values.endMonth}
              options={MONTH_OPTIONS}
              onChange={(val) => onChange('endMonth', val)}
              disabled={disabled}
              placeholder="Month"
              error={errors.endMonth}
            />
            <Dropdown
              value={values.endYear}
              options={YEAR_OPTIONS}
              onChange={(val) => onChange('endYear', val)}
              disabled={disabled}
              placeholder="Year"
              error={errors.endYear}
            />
          </div>
        </FormField>
      )}

      {/* Description Textarea */}
      <FormField label="Description" error={errors.note}>
        <Textarea
          rows={3}
          value={values.note}
          onChange={(e) => onChange('note', e.target.value)}
          disabled={disabled}
          placeholder="Tell us about it"
          style={{
            width: '100%',
            borderRadius: '8px',
            border: errors.note ? '1px solid #DC2626' : '1px solid #CBD5E1',
            padding: '10px 12px',
            fontSize: '14px',
            outline: 'none',
            fontFamily: 'inherit',
            resize: 'vertical',
          }}
        />
      </FormField>
    </div>
  );
};
