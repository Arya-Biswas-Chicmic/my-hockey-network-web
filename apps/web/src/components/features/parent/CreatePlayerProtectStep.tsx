import React from 'react';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/common/Spinner';

export interface PlayerProtectFormData {
  profileVisibility: 'CONNECTIONS' | 'PUBLIC';
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

export const CreatePlayerProtectStep: React.FC<CreatePlayerProtectStepProps> = ({
  playerNameFirst,
  formData,
  onChange,
  onSubmit,
  onBack,
  loading,
}) => {
  return (
    <div className="mhn-parent-step-container mhn-parent-step-container-max440">
      <h2 className="mhn-parent-step-title">Protect {playerNameFirst}'s profile</h2>
      <p className="mhn-parent-step-desc">You can change these settings anytime.</p>

      {/* Profile Visibility Cards */}
      <div className="mhn-mb-20">
        <div className="mhn-section-header-title">
          PROFILE VISIBILITY
        </div>
        <div className="mhn-col-flex-gap-10">
          <div
            className={`mhn-parent-visibility-card ${formData.profileVisibility === 'CONNECTIONS' ? 'mhn-selected' : ''}`}
            onClick={() => onChange({ profileVisibility: 'CONNECTIONS' })}
          >
            <div className={`mhn-parent-radio-dot ${formData.profileVisibility === 'CONNECTIONS' ? 'mhn-selected' : ''}`} />
            <div>
              <div className="mhn-parent-card-title-lg">Private</div>
              <div className="mhn-parent-card-sub-sm">
                Only approved hockey relationships can see {playerNameFirst}'s profile.
              </div>
            </div>
          </div>

          <div
            className={`mhn-parent-visibility-card ${formData.profileVisibility === 'PUBLIC' ? 'mhn-selected' : ''}`}
            onClick={() => onChange({ profileVisibility: 'PUBLIC' })}
          >
            <div className={`mhn-parent-radio-dot ${formData.profileVisibility === 'PUBLIC' ? 'mhn-selected' : ''}`} />
            <div>
              <div className="mhn-parent-card-title-lg">Hockey Network</div>
              <div className="mhn-parent-card-sub-sm">
                Approved team and association members may see limited information.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Connections Toggles */}
      <div className="mhn-mb-24">
        <div className="mhn-section-header-title-mb10">
          CONTACT & CONNECTIONS
        </div>
        <div className="mhn-col-flex-gap-12">
          {([
            { key: 'requireApprovalAdultContact', label: 'Adult contact requests', sub: 'Require my approval' },
            { key: 'requireApprovalConnections', label: 'Connections', sub: 'Require my approval' },
            { key: 'requireApprovalTeamInvites', label: 'Team invitations', sub: 'Require my approval' },
            { key: 'requireApprovalMedia', label: 'Media visibility', sub: 'Require my approval' },
          ] as const).map((item) => {
            const isChecked = formData[item.key];
            return (
              <div key={item.key} className="mhn-toggle-row-between">
                <div>
                  <div className="mhn-toggle-label">{item.label}</div>
                  <div className="mhn-toggle-sub">{item.sub}</div>
                </div>
                <div
                  className={`mhn-parent-toggle-track ${isChecked ? 'mhn-active' : ''}`}
                  onClick={() => onChange({ [item.key]: !isChecked })}
                >
                  <div className={`mhn-parent-toggle-thumb ${isChecked ? 'mhn-active' : ''}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mhn-col-flex-gap-8">
        <Button
          type="button"
          disabled={loading}
          className="mhn-parent-btn-primary"
          onClick={onSubmit}
        >
          {loading && <Spinner size="sm" color="#FFFFFF" />}
          <span>Create Player Profile</span>
        </Button>
        <Button type="button" className="mhn-parent-btn-back" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
};
