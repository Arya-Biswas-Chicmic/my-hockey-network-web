'use client';

import { useState } from 'react';
import { ProfileAboutSectionEnum } from '@my-hockey-network/contracts';
import type { CareerEntry } from '@my-hockey-network/core';
import type {
  ProfileIntroFormValues,
  ProfilePersonalDetailsFormValues,
  CareerFormValues,
} from '@my-hockey-network/validation';

import { Button } from '@/components/common/Button';
import { ProfileIntroSection } from '@/components/features/profile/ProfileIntroSection';
import { ProfilePersonalDetailsSection } from '@/components/features/profile/ProfilePersonalDetailsSection';
import { ProfileCareerSection } from '@/components/features/profile/ProfileCareerSection';

export interface ProfileAboutTabProps {
  canHaveCareer: boolean;
  intro: {
    bio: string;
    position: string;
    jerseyNumber: string;
    role: string;
    isPlayer: boolean;
    isSaving: boolean;
    saveMessage: string | null;
    onSave: (values: ProfileIntroFormValues) => Promise<void> | void;
  };
  details: {
    city: string;
    dateOfBirth: string;
    genderCategory: string;
    isSaving: boolean;
    saveMessage: string | null;
    onSave: (values: ProfilePersonalDetailsFormValues) => Promise<void> | void;
  };
  career: {
    entries: CareerEntry[] | null;
    isSavingTeam: boolean;
    isDeletingTeamId: string | null;
    onSaveTeam: (values: CareerFormValues, editingTeamId: string | null) => Promise<boolean>;
    onRequestDelete: (team: CareerEntry) => void;
  };
}

/**
 * Profile > About tab: sidebar section nav (Intro / Career / Personal
 * Details) plus the three RHF+Zod sections themselves. Extracted from
 * `screens/profile-page.tsx`; `activeAboutSection` is pure UI navigation
 * state with no data dependency, so it's owned here rather than threaded
 * through the parent screen.
 */
export function ProfileAboutTab({ canHaveCareer, intro, details, career }: Readonly<ProfileAboutTabProps>) {
  const [activeSection, setActiveSection] = useState<ProfileAboutSectionEnum>(ProfileAboutSectionEnum.INTRO);

  return (
    <div className="mhn-profile-tab-content-card-full mhn-about-card-padding-override">
      <div className="mhn-about-2col-container">
        {/* Left Sidebar */}
        <div className="mhn-about-sidebar">
          <h3 className="mhn-about-sidebar-title">About</h3>

          <aside className="mhn-about-sidebar-card">
            <Button
              onClick={() => setActiveSection(ProfileAboutSectionEnum.INTRO)}
              className={`mhn-about-menu-btn ${activeSection === ProfileAboutSectionEnum.INTRO ? 'mhn-about-btn-active' : ''}`}
            >
              Intro
            </Button>
            {canHaveCareer && (
              <Button
                onClick={() => setActiveSection(ProfileAboutSectionEnum.CAREER)}
                className={`mhn-about-menu-btn ${activeSection === ProfileAboutSectionEnum.CAREER ? 'mhn-about-btn-active' : ''}`}
              >
                Career
              </Button>
            )}
            <Button
              onClick={() => setActiveSection(ProfileAboutSectionEnum.DETAILS)}
              className={`mhn-about-menu-btn ${activeSection === ProfileAboutSectionEnum.DETAILS ? 'mhn-about-btn-active' : ''}`}
            >
              Personal Details
            </Button>
          </aside>
        </div>

        {/* Right Detail Panel */}
        <div className="mhn-about-main-panel">
          {activeSection === ProfileAboutSectionEnum.INTRO && <ProfileIntroSection {...intro} />}

          {activeSection === ProfileAboutSectionEnum.CAREER && canHaveCareer && (
            <ProfileCareerSection
              careerEntries={career.entries}
              isSavingTeam={career.isSavingTeam}
              isDeletingTeamId={career.isDeletingTeamId}
              onSaveTeam={career.onSaveTeam}
              onRequestDelete={career.onRequestDelete}
            />
          )}

          {activeSection === ProfileAboutSectionEnum.DETAILS && <ProfilePersonalDetailsSection {...details} />}
        </div>
      </div>
    </div>
  );
}
