import React from 'react';

interface OnboardingIllustrationProps {
  imageSrc?: string;
  altText?: string;
}

export const OnboardingIllustration: React.FC<OnboardingIllustrationProps> = ({
  imageSrc = '/Welcome.png',
  altText = 'Hockey Illustration',
}) => {
  return (
    <div className="illustration-panel" aria-label="Graphic illustration panel">
      <img
        src={imageSrc}
        alt={altText}
        className="illustration-img"
        loading="eager"
      />
    </div>
  );
};
