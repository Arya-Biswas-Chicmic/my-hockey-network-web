"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/common/Button";
import { BackButton } from "@/components/common/BackButton";
import { Form } from "@/components/ui/form";
import { FormInput, FormDateInput, FormSelect } from "@/components/form/fields";
import { GUARDIAN_RELATION_OPTIONS } from "@/utils/guardianUtils";
import {
  parentOnboardingPlayerDetailsFormSchema,
  type PlayerDetailsFormValues,
} from "@my-hockey-network/validation";

export type { PlayerDetailsFormValues };

export interface PlayerDetailsFormFieldsProps {
  defaultValues?: Partial<PlayerDetailsFormValues>;
  onSubmit: (values: PlayerDetailsFormValues) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  containerClassName?: string;
}

const EMPTY_VALUES: PlayerDetailsFormValues = {
  fullName: "",
  dateOfBirth: "",
  guardianRelation: "MOTHER",
  email: "",
};

/**
 * Shared "Player Details" form (Full Name / DOB / Relationship / Email) used by both
 * signup's `ParentOnboardingModal` and Supervision's "+ Add Player" flow — both create a
 * managed child via the same `createManagedChild` API, so they share this form, its
 * `FormInput`-based fields, and `parentOnboardingPlayerDetailsFormSchema` validation
 * (including its 5–100 year age check).
 */
export function PlayerDetailsFormFields({
  defaultValues,
  onSubmit,
  onBack,
  isSubmitting = false,
  submitLabel = "Continue",
  containerClassName = "mhn-parent-step-container",
}: Readonly<PlayerDetailsFormFieldsProps>) {
  const form = useForm<PlayerDetailsFormValues>({
    resolver: zodResolver(parentOnboardingPlayerDetailsFormSchema),
    mode: "onChange",
    defaultValues: { ...EMPTY_VALUES, ...defaultValues },
  });

  const handleSubmit = form.handleSubmit((values) => onSubmit(values));

  return (
    <div className={containerClassName}>
      <h2 className="mhn-parent-step-title">Player Details</h2>
      <p className="mhn-parent-step-desc">
        Tell us a little about your player.
      </p>

      <Form
        methods={form}
        onSubmit={handleSubmit}
        className="mhn-col-flex-gap-18"
        noValidate
      >
        <FormInput<PlayerDetailsFormValues, "fullName">
          name="fullName"
          label="Full Name"
          required
          maxLength={50}
          placeholder="Enter your name"
          isNameInput
        />

        <FormDateInput<PlayerDetailsFormValues, "dateOfBirth">
          name="dateOfBirth"
          label="DOB"
          required
          showAgeBadge={false}
        />

        <FormSelect<PlayerDetailsFormValues, "guardianRelation">
          name="guardianRelation"
          label="Relationship to player"
          required
          options={GUARDIAN_RELATION_OPTIONS}
        />

        <FormInput<PlayerDetailsFormValues, "email">
          name="email"
          label="Email"
          required
          type="email"
          placeholder="admin@gmail.com"
          isEmailInput
        />

        <div className="mhn-parent-actions-stack">
          <Button
            type="submit"
            className="mhn-parent-btn-primary"
            disabled={isSubmitting}
          >
            {submitLabel}
          </Button>
          <BackButton onClick={onBack} />
        </div>
      </Form>
    </div>
  );
}
