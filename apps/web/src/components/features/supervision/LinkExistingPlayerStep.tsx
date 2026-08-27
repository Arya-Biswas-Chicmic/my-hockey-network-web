'use client';

import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/FormControls';
import { Spinner } from '@/components/common/Spinner';
import { linkPlayerFormSchema, type LinkPlayerFormValues } from '@my-hockey-network/validation';

export interface LinkExistingPlayerStepProps {
  onSend: (values: LinkPlayerFormValues) => Promise<void> | void;
  onBack: () => void;
  onNavigateHelp?: () => void;
  isSending: boolean;
}

/**
 * Supervision > Add Player > "Link an existing player" step. RHF + Zod
 * (`linkPlayerFormSchema`) replaces the hand-rolled `linkChildEmail`/
 * `linkEmailError` state pair this used to be. Extracted from
 * `screens/supervision-page.tsx`.
 */
export function LinkExistingPlayerStep({ onSend, onBack, onNavigateHelp, isSending }: Readonly<LinkExistingPlayerStepProps>) {
  const form = useForm<LinkPlayerFormValues>({
    resolver: zodResolver(linkPlayerFormSchema),
    mode: 'onChange',
    defaultValues: { email: '' },
  });

  const watchedValues = useWatch({ control: form.control });
  const email = watchedValues.email ?? '';
  const error = form.formState.errors.email?.message;

  const handleSubmit = form.handleSubmit((data) => onSend(data));

  return (
    <div className="mhn-flow-container mhn-flow-form-wrapper">
      <h2 className="mhn-flow-title">Supervise your child</h2>
      <p className="mhn-flow-subtitle">Invite your teen to partner with you on supervising their Teen Account.</p>

      <div className="mhn-form-fields-stack">
        <div className="mhn-form-field-group">
          <label className="mhn-form-field-label">Child Email Address</label>
          <Input
            type="email"
            value={email}
            onValueChange={(value) => form.setValue('email', value, { shouldValidate: form.formState.isSubmitted })}
            placeholder="email@example.com"
            className={`mhn-form-input ${error ? 'mhn-input-error' : ''}`}
          />
          {error && <div className="mhn-input-error-msg">{error}</div>}
        </div>
      </div>

      <div className="mhn-form-actions-stack">
        <Button className="mhn-btn-solid-blue mhn-btn-loading-flex" onClick={handleSubmit} disabled={isSending}>
          {isSending && <Spinner size="sm" color="#FFFFFF" />}
          <span>{isSending ? 'Sending Invitation...' : 'Send Invitation'}</span>
        </Button>
        <Button className="mhn-btn-outline" onClick={onBack}>
          Back
        </Button>
      </div>

      <div className="mhn-trouble-footer">
        <span className="having">Having trouble? </span>
        <a
          href="/help"
          onClick={(e) => {
            if (onNavigateHelp) {
              e.preventDefault();
              onNavigateHelp();
            }
          }}
          className="mhn-trouble-link"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
