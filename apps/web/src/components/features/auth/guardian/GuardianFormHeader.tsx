import React from 'react';
import Image from 'next/image';
import { GUARDIAN_APPROVAL_STRINGS } from '@my-hockey-network/shared';
import { FamilyBadgeIcon } from '@/components/features/auth/guardian/GuardianIcons';

export const GuardianFormHeader: React.FC = () => {
  return (
    <>
      <div className="guardian-badge-wrapper">

         <Image
        src="/girdian.webp"
        alt="parent-icon"
        width={96}
        height={96}
        className="guardian-parent-icon"
      />
      </div>

      <div className="guardian-form-header">
        <h2 className="guardian-form-title">
          {GUARDIAN_APPROVAL_STRINGS.formTitle}
        </h2>
        <p className="guardian-form-subtitle">
          {GUARDIAN_APPROVAL_STRINGS.formSubtitle}
        </p>
      </div>
    </>
  );
};
