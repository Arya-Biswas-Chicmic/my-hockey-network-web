import React from "react";

export const GuardianRequestSkeleton: React.FC = () => {
  return (
    <div className="mhn-guardian-request-grid">
      {[1, 2].map((key) => (
        <div key={key} className="mhn-guardian-request-card-skeleton">
          {/* Shimmer Avatar */}
          <div className="mhn-shimmer-box mhn-guardian-skeleton-avatar" />

          {/* Shimmer Name */}
          <div className="mhn-shimmer-box mhn-guardian-skeleton-name" />

          {/* Shimmer Role */}
          <div className="mhn-shimmer-box mhn-guardian-skeleton-role" />

          {/* Shimmer Team Pill */}
          <div className="mhn-shimmer-box mhn-guardian-skeleton-team" />

          {/* Shimmer Location */}
          <div className="mhn-shimmer-box mhn-guardian-skeleton-loc" />

          {/* Shimmer Buttons Row */}
          <div className="mhn-guardian-skeleton-btns-row">
            <div className="mhn-shimmer-box mhn-guardian-skeleton-btn1" />
            <div className="mhn-shimmer-box mhn-guardian-skeleton-btn2" />
          </div>
        </div>
      ))}
    </div>
  );
};
