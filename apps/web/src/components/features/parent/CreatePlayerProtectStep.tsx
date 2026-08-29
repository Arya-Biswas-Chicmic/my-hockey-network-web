import React from "react";
import { Button } from "@/components/common/Button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/common/Spinner";

export interface PlayerProtectFormData {
  profileVisibility: "CONNECTIONS" | "PUBLIC";
  requireApprovalAdultContact: boolean;
  requireApprovalConnections: boolean;
  requireApprovalTeamInvites: boolean;
  requireApprovalMedia: boolean;
}

interface CreatePlayerProtectStepProps {
  playerNameFirst: string;
  formData: PlayerProtectFormData;
  onChange: (updated: Partial<PlayerProtectFormData>) => void;
  onSubmit: () => void;
  onBack: () => void;
  loading: boolean;
}

export const CreatePlayerProtectStep: React.FC<
  CreatePlayerProtectStepProps
> = ({ playerNameFirst, formData, onChange, onSubmit, onBack, loading }) => {
  return (
    <div className="mhn-parent-step-container mhn-parent-step-container-max440 mhn-parent-step-protect">
      <h2 className="mhn-parent-step-title">
        Protect {playerNameFirst}&apos;s profile
      </h2>
      <p className="mhn-parent-step-desc">
        You can change these settings anytime.
      </p>

      {/* Profile Visibility Cards */}
      <div className="mhn-mb-14">
        <div className="mhn-section-header-title">PROFILE VISIBILITY</div>
        <div className="mhn-col-flex-gap-8">
          <Button
            type="button"
            role="radio"
            aria-checked={formData.profileVisibility === "CONNECTIONS"}
            className={`mhn-parent-visibility-card ${formData.profileVisibility === "CONNECTIONS" ? "mhn-selected" : ""}`}
            onClick={() => onChange({ profileVisibility: "CONNECTIONS" })}
          >
            <div
              className={`mhn-parent-radio-dot ${formData.profileVisibility === "CONNECTIONS" ? "mhn-selected" : ""}`}
            />
            <div>
              <div className="mhn-parent-card-title-lg">Private</div>
              <div className="mhn-parent-card-sub-sm">
                Only approved hockey relationships can see {playerNameFirst}
                &apos;s profile.
              </div>
            </div>
          </Button>

          <Button
            type="button"
            role="radio"
            aria-checked={formData.profileVisibility === "PUBLIC"}
            className={`mhn-parent-visibility-card ${formData.profileVisibility === "PUBLIC" ? "mhn-selected" : ""}`}
            onClick={() => onChange({ profileVisibility: "PUBLIC" })}
          >
            <div
              className={`mhn-parent-radio-dot ${formData.profileVisibility === "PUBLIC" ? "mhn-selected" : ""}`}
            />
            <div>
              <div className="mhn-parent-card-title-lg">Hockey Network</div>
              <div className="mhn-parent-card-sub-sm">
                Approved team and association members may see limited
                information.
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Contact & Connections Toggles */}
      <div className="mhn-mb-16 mhn-mt-14">
        <div className="mhn-section-header-title-mb10">
          CONTACT & CONNECTIONS
        </div>
        <div className="mhn-col-flex-gap-8">
          {(
            [
              {
                key: "requireApprovalAdultContact",
                label: "Adult contact requests",
                sub: "Require my approval",
              },
              {
                key: "requireApprovalConnections",
                label: "Connections",
                sub: "Require my approval",
              },
              {
                key: "requireApprovalTeamInvites",
                label: "Team invitations",
                sub: "Require my approval",
              },
              {
                key: "requireApprovalMedia",
                label: "Media visibility",
                sub: "Require my approval",
              },
            ] as const
          ).map((item) => {
            const isChecked = formData[item.key];
            return (
              <div key={item.key} className="mhn-toggle-row-between">
                <div>
                  <div className="mhn-toggle-label">{item.label}</div>
                  <div className="mhn-toggle-sub">{item.sub}</div>
                </div>
                <Switch
                  checked={isChecked}
                  aria-label={item.label}
                  onClick={() => onChange({ [item.key]: !isChecked })}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mhn-parent-actions-stack">
        <Button
          type="button"
          disabled={loading}
          className="mhn-parent-btn-primary"
          onClick={onSubmit}
        >
          {loading && <Spinner size="sm" color="#FFFFFF" />}
          <span>Create Player Profile</span>
        </Button>
        <Button
          type="button"
          className="mhn-parent-btn-secondary"
          onClick={onBack}
        >
          Back
        </Button>
      </div>
    </div>
  );
};
