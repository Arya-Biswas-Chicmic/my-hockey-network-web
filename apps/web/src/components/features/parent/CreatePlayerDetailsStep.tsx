import React, { useRef, useMemo, useState } from 'react';
import { Button } from '../../common/Button';
import { Input, Dropdown, FormField } from '../../common/FormControls';
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
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

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
    setTouched((prev) => ({ ...prev, dateOfBirth: true }));
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
        setTouched((prev) => ({ ...prev, dateOfBirth: true }));
      }
    }
  };

  // Field Level Validation Logic
  const getFullNameError = (): string | null => {
    const trimmed = formData.fullName.trim();
    if (!trimmed) return 'Full Name is required.';
    if (trimmed.length < 2) return 'Full Name must be at least 2 characters.';
    if (formData.fullName.length >= 50) return 'Maximum 50 characters allowed.';
    return null;
  };

  const getDobError = (): string | null => {
    if (!formData.dateOfBirth) return 'Date of Birth is required.';
    if (formData.dateOfBirth.length < 10) return 'Please enter a valid Date of Birth (DD/MM/YYYY).';
    if (currentAge === null || currentAge < 0) return 'Please enter a valid Date of Birth.';
    if (currentAge < 5) return 'Minimum age for player profile is 5 years.';
    if (currentAge > 100) return 'Maximum age for player profile is 100 years.';
    return null;
  };

  const getRelationError = (): string | null => {
    if (!formData.guardianRelation) return 'Relationship to player is required.';
    return null;
  };

  const getEmailError = (): string | null => {
    const trimmed = formData.email.trim();
    if (!trimmed) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) return 'Please enter a valid email address.';
    return null;
  };

  const fullNameError = (touched.fullName || hasAttemptedSubmit) ? getFullNameError() : null;
  const dobError = (touched.dateOfBirth || hasAttemptedSubmit) ? getDobError() : null;
  const relationError = (touched.guardianRelation || hasAttemptedSubmit) ? getRelationError() : null;
  const emailError = (touched.email || hasAttemptedSubmit) ? getEmailError() : null;

  const isValid =
    !getFullNameError() &&
    !getDobError() &&
    !getRelationError() &&
    !getEmailError();

  const handleContinueClick = () => {
    setHasAttemptedSubmit(true);
    setTouched({ fullName: true, dateOfBirth: true, guardianRelation: true, email: true });
    if (isValid) {
      onContinue();
    }
  };

  return (
    <div className="mhn-parent-step-container">
      <h2 className="mhn-parent-step-title">Player Details</h2>
      <p className="mhn-parent-step-desc">Tell us a little about your player.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Full Name */}
        <FormField label="Full Name" required error={fullNameError} maxLength={50} valueLength={formData.fullName?.length}>
          <Input
            type="text"
            className={`auth-input ${fullNameError || (formData.fullName && formData.fullName.length >= 50) ? 'mhn-input-invalid' : ''}`}
            value={formData.fullName}
            onChange={(e) => {
              onChange({ fullName: e.target.value });
              if (!touched.fullName) setTouched((prev) => ({ ...prev, fullName: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, fullName: true }))}
            maxLength={50}
            placeholder="e.g. Connor McDavid"
          />
        </FormField>

        {/* DOB */}
        <FormField label="DOB" required error={dobError}>
          <div style={{ position: 'relative' }}>
            <Input
              type="text"
              className={`auth-input ${dobError ? 'mhn-input-invalid' : ''}`}
              value={formData.dateOfBirth}
              onChange={handleDobChange}
              onBlur={() => setTouched((prev) => ({ ...prev, dateOfBirth: true }))}
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
        </FormField>

        {/* Relationship */}
        <Dropdown
          label="Relationship to player"
          required
          value={formData.guardianRelation}
          options={GUARDIAN_RELATION_OPTIONS}
          onChange={(val) => {
            onChange({ guardianRelation: val as any });
            setTouched((prev) => ({ ...prev, guardianRelation: true }));
          }}
          error={relationError}
          placeholder="Select relationship"
        />

        {/* Email */}
        <FormField label="Email" required error={emailError}>
          <Input
            type="email"
            className={`auth-input ${emailError ? 'mhn-input-invalid' : ''}`}
            value={formData.email}
            onChange={(e) => {
              onChange({ email: e.target.value });
              if (!touched.email) setTouched((prev) => ({ ...prev, email: true }));
            }}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            placeholder="e.g. admin@gmail.com"
          />
        </FormField>
      </div>

      <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <Button
          type="button"
          className="mhn-parent-btn-primary"
          onClick={handleContinueClick}
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
