import React from 'react';
import Image from 'next/image';

export const GuardianIllustrationPanel: React.FC = () => {
  return (
    <div className="guardian-panel" aria-label="Guardian Approval Illustration Panel">
      <Image
        src="/empowering.png"
        alt="Empowering the next generation of athletes"
        fill
        className="guardian-panel-img"
      />
    </div>
  );
};
