import React from 'react';
import { Button } from '../../common/Button';
import { Spinner } from '../../common/Spinner';

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
    <div className="mhn-parent-step-container" style={{ maxWidth: '440px' }}>
      <h2 className="mhn-parent-step-title">Protect {playerNameFirst}'s profile</h2>
      <p className="mhn-parent-step-desc">You can change these settings anytime.</p>

      {/* Profile Visibility Cards */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.5px', marginBottom: '8px' }}>
          PROFILE VISIBILITY
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div
            className={`mhn-parent-visibility-card ${formData.profileVisibility === 'CONNECTIONS' ? 'mhn-selected' : ''}`}
            onClick={() => onChange({ profileVisibility: 'CONNECTIONS' })}
          >
            <div className={`mhn-parent-radio-dot ${formData.profileVisibility === 'CONNECTIONS' ? 'mhn-selected' : ''}`} />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Private</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
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
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>Hockey Network</div>
              <div style={{ fontSize: '12px', color: '#64748B' }}>
                Approved team and association members may see limited information.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact & Connections Toggles */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.5px', marginBottom: '10px' }}>
          CONTACT & CONNECTIONS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { key: 'requireApprovalAdultContact', label: 'Adult contact requests', sub: 'Require my approval' },
            { key: 'requireApprovalConnections', label: 'Connections', sub: 'Require my approval' },
            { key: 'requireApprovalTeamInvites', label: 'Team invitations', sub: 'Require my approval' },
            { key: 'requireApprovalMedia', label: 'Media visibility', sub: 'Require my approval' },
          ].map((item) => {
            const isChecked = Boolean((formData as any)[item.key]);
            return (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#0F172A' }}>{item.label}</div>
                  <div style={{ fontSize: '12px', color: '#94A3B8' }}>{item.sub}</div>
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
