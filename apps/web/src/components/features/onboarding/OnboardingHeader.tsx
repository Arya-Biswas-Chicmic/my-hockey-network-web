import React from 'react';

interface OnboardingHeaderProps {
  title: string;
  subtitle: string;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({
  title,
  subtitle,
}) => {
  return (
    <div className="header-wrapper">
      <h1 className="onboarding-title">
        {title.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < title.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </h1>
      <p className="onboarding-subtitle">
        {subtitle.split('\n').map((line, index) => (
          <React.Fragment key={index}>
            {line}
            {index < subtitle.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
};
