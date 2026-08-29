"use client";

import { useState } from "react";

import { Button } from "@/components/common/Button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/common/FormControls";
import { Spinner } from "@/components/common/Spinner";

export interface ProtectSettings {
  visibility: "private" | "network";
  adultRequests: boolean;
  connections: boolean;
  teamInvitations: boolean;
  mediaVisibility: boolean;
}

export const DEFAULT_PROTECT_SETTINGS: ProtectSettings = {
  visibility: "private",
  adultRequests: true,
  connections: true,
  teamInvitations: true,
  mediaVisibility: true,
};

export interface CreatePlayerProtectStepProps {
  playerName: string;
  onBack: () => void;
  onSubmit: (settings: ProtectSettings) => void;
  isSubmitting: boolean;
}

/**
 * Supervision > Add Player > "Protect profile" step: visibility radios and
 * approval-requirement toggles. No field validation, so this stays plain
 * local state rather than RHF. Extracted from `screens/supervision-page.tsx`.
 */
export function CreatePlayerProtectStep({
  playerName,
  onBack,
  onSubmit,
  isSubmitting,
}: Readonly<CreatePlayerProtectStepProps>) {
  const [settings, setSettings] = useState<ProtectSettings>(
    DEFAULT_PROTECT_SETTINGS,
  );
  const name = playerName || "Noah";

  return (
    <div className="mhn-flow-container mhn-flow-form-wrapper">
      <h2 className="mhn-flow-title">Protect {name}&apos;s profile</h2>
      <p className="mhn-flow-subtitle">
        You can change these settings anytime.
      </p>

      <div className="mhn-protect-section">
        <span className="mhn-protect-section-title">PROFILE VISIBILITY</span>
        <div className="mhn-protect-cards-stack">
          <label
            className={`mhn-protect-radio-card ${settings.visibility === "private" ? "mhn-radio-selected" : ""}`}
            onClick={() =>
              setSettings((p) => ({ ...p, visibility: "private" }))
            }
          >
            <Input
              type="radio"
              name="visibility"
              checked={settings.visibility === "private"}
              onChange={() =>
                setSettings((p) => ({ ...p, visibility: "private" }))
              }
              className="mhn-radio-input"
            />
            <div className="mhn-radio-card-text">
              <h4 className="mhn-radio-heading">Private</h4>
              <p className="mhn-radio-sub">
                Only approved hockey relationships can see {name}&apos;s
                profile.
              </p>
            </div>
          </label>

          <label
            className={`mhn-protect-radio-card ${settings.visibility === "network" ? "mhn-radio-selected" : ""}`}
            onClick={() =>
              setSettings((p) => ({ ...p, visibility: "network" }))
            }
          >
            <Input
              type="radio"
              name="visibility"
              checked={settings.visibility === "network"}
              onChange={() =>
                setSettings((p) => ({ ...p, visibility: "network" }))
              }
              className="mhn-radio-input"
            />
            <div className="mhn-radio-card-text">
              <h4 className="mhn-radio-heading">Hockey Network</h4>
              <p className="mhn-radio-sub">
                Approved team and association members may see limited
                information.
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="mhn-protect-section">
        <span className="mhn-protect-section-title">CONTACT & CONNECTIONS</span>
        <div className="mhn-protect-toggles-stack">
          {(
            [
              ["adultRequests", "Adult contact requests"],
              ["connections", "Connections"],
              ["teamInvitations", "Team invitations"],
              ["mediaVisibility", "Media visibility"],
            ] as const
          ).map(([key, heading]) => (
            <div key={key} className="mhn-protect-toggle-row">
              <div className="mhn-protect-toggle-text">
                <h4 className="mhn-protect-toggle-heading">{heading}</h4>
                <p className="mhn-protect-toggle-sub">Require my approval</p>
              </div>
              <Switch
                checked={settings[key]}
                onClick={() => setSettings((p) => ({ ...p, [key]: !p[key] }))}
                aria-label={heading}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mhn-form-actions-stack">
        <Button
          className="mhn-btn-modal-cancel"
          onClick={onBack}
          disabled={isSubmitting}
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={() => onSubmit(settings)}
          disabled={isSubmitting}
          className="mhn-btn-modal-submit"
        >
          {isSubmitting ? (
            <Spinner size="sm" color="#FFFFFF" />
          ) : (
            "Create Account"
          )}
        </Button>
      </div>
    </div>
  );
}
