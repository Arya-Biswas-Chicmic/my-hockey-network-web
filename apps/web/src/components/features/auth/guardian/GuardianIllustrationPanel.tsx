import React from 'react';

export const GuardianIllustrationPanel: React.FC = () => {
  return (
    <div className="guardian-panel" aria-label="Guardian Approval Illustration Panel">
      <img
        src="/empowering.png"
        alt="Empowering the next generation of athletes"
        className="guardian-panel-img"
      />
    </div>
  );
};
