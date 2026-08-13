import React from 'react';

export const DotGridPattern: React.FC<{ className: string; id: string; width: number; height: number }> = ({
  className,
  id,
  width,
  height,
}) => (
  <svg className={`bg-shape ${className}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
    <pattern id={id} x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
      <circle cx="4" cy="4" r="2" fill="rgba(255, 255, 255, 0.15)" />
    </pattern>
    <rect width={width} height={height} fill={`url(#${id})`} />
  </svg>
);

export const CircleShape: React.FC<{ className: string; size: number; radius: number; strokeWidth: number }> = ({
  className,
  size,
  radius,
  strokeWidth,
}) => (
  <svg className={`bg-shape ${className}`} width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
    <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255, 255, 255, 0.12)" strokeWidth={strokeWidth} />
  </svg>
);

export const ChevronShape: React.FC<{ className: string; path: string; width: number; height: number }> = ({
  className,
  path,
  width,
  height,
}) => (
  <svg className={`bg-shape ${className}`} width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
    <path d={path} stroke="rgba(255, 255, 255, 0.15)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
