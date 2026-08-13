import React from 'react';
import { DotGridPattern, CircleShape, ChevronShape } from './GuardianBackgroundShapes';

export const GuardianPanelBackground: React.FC = () => {
  return (
    <div className="guardian-panel-bg-overlay" aria-hidden="true">
      <DotGridPattern className="shape-dots-left" id="dotGrid1" width={80} height={80} />
      <DotGridPattern className="shape-dots-right" id="dotGrid2" width={96} height={64} />
      <CircleShape className="shape-circle-lg" size={120} radius={54} strokeWidth={3} />
      <CircleShape className="shape-circle-sm" size={50} radius={24} strokeWidth={2} />
      <ChevronShape className="shape-chevron-right" path="M8 16L32 48L8 80" width={48} height={96} />
      <ChevronShape className="shape-chevron-left" path="M32 8L12 32L32 56" width={40} height={64} />
    </div>
  );
};
