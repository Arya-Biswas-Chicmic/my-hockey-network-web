import React, { useRef, useMemo } from 'react';
import { Button } from '../../common/Button';
import { Input, Select } from '../../common/FormControls';
import { calculateAge } from '@my-hockey-network/core';
import { GUARDIAN_RELATION_OPTIONS } from '../../../utils/guardianUtils';

export interface PlayerDetailsFormData {
  fullName: string;
  dateOfBirth: string;
  guardianRelation: 'MOTHER' | 'FATHER' | 'LEGAL_GUARDIAN' | 'GRANDPARENT' | 'OTHER';
  email: string;
}

interface CreatePlayerDetailsStepProps {
  formData: PlayerDetailsFormData;
  onChange: (updated: Partial<PlayerDetailsFormData>) => void;
  onContinue: () => void;
  onBack: () => void;
}

export const CreatePlayerDetailsStep: React.FC<CreatePlayerDetailsStepProps> = ({
  formData,
  onChange,
  onContinue,
  onBack,
}) => {
  const dateInputRef = useRef<HTMLInputElement>(null);

  // Compute real-time age
  const currentAge = useMemo(() => calculateAge(formData.dateOfBirth), [formData.dateOfBirth]);

  // Smart DOB auto-formatter: e.g. 10042020 -> 10/04/2020
  const formatDobInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) {
      return digits;
    }
    if (digits.length <= 4) {
      return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    const formatted = formatDobInput(rawVal);
    onChange({ dateOfBirth: formatted });
  };

  const handleCalendarClick = () => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.click();
      }
    }
  };

  const handleDatePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateVal = e.target.value; // Format: YYYY-MM-DD
    if (dateVal) {
      const parts = dateVal.split('-');
      if (parts.length === 3) {
        const [yyyy, mm, dd] = parts;
        onChange({ dateOfBirth: `${dd}/${mm}/${yyyy}` });
      }
    }
  };

  const isValid =
    formData.fullName.trim().length >= 2 &&
    formData.dateOfBirth.length === 10 &&
    currentAge !== null &&
    currentAge >= 0 &&
    formData.guardianRelation;

  return (
    <div className="mhn-parent-step-container">
      <h2 className="mhn-parent-step-title">Player Details</h2>
      <p className="mhn-parent-step-desc">Tell us a little about your player.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="auth-form-group">
          <label className="auth-label">Full Name</label>
          <div className="auth-input-wrapper">
            <Input
              type="text"
              className="auth-input"
              value={formData.fullName}
              onChange={(e) => onChange({ fullName: e.target.value })}
              placeholder="enter your name"
            />
          </div>
        </div>

        <div className="auth-form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="auth-label" style={{ marginBottom: 0 }}>DOB</label>
            {currentAge !== null && currentAge >= 0 && currentAge <= 110 ? (
              <span style={{ fontSize: '12px', fontWeight: 600, color: currentAge < 18 ? '#D97706' : '#4B5563' }}>
                Age: {currentAge} yrs {currentAge < 18 ? '(Minor)' : ''}
              </span>
            ) : formData.dateOfBirth.length === 10 ? (
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#EF4444' }}>
                Invalid Date
              </span>
            ) : null}
          </div>
          <div className="auth-input-wrapper" style={{ position: 'relative' }}>
            <Input
              type="text"
              className="auth-input"
              value={formData.dateOfBirth}
              onChange={handleDobChange}
              placeholder="DD/MM/YYYY"
              maxLength={10}
            />
            <img
              src="/calendar.png"
              alt="Calendar"
              className="auth-input-icon auth-input-icon-clickable"
              onClick={handleCalendarClick}
              style={{ cursor: 'pointer' }}
            />
            <Input
              type="date"
              ref={dateInputRef}
              onChange={handleDatePickerChange}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: 0,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label">Relationship to player</label>
          <div className="auth-input-wrapper">
            <Select
              className="auth-select"
              value={formData.guardianRelation}
              onChange={(e: any) => onChange({ guardianRelation: e.target.value })}
            >
              {GUARDIAN_RELATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="auth-form-group">
          <label className="auth-label">Email (Optional)</label>
          <div className="auth-input-wrapper">
            <Input
              type="email"
              className="auth-input"
              value={formData.email}
              onChange={(e) => onChange({ email: e.target.value })}
              placeholder="admin@gmail.com"
            />
          </div>
        </div>
      </div>

      <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Button
          type="button"
          disabled={!isValid}
          className="mhn-parent-btn-primary"
          onClick={onContinue}
        >
          Continue
        </Button>
        <Button type="button" className="mhn-parent-btn-secondary" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};
