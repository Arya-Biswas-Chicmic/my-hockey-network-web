import React from 'react';
import Image from 'next/image';

export const ParentHeroCard: React.FC = () => {
  return (
    <div className="mhn-parent-hero-panel">
      <Image src="/empowering.png" alt="Empowering athletes" fill className="mhn-parent-hero-img" />
    </div>
  );
};
