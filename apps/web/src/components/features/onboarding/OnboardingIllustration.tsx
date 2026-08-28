import React from 'react';
import Image from 'next/image';

interface OnboardingIllustrationProps {
  imageSrc?: string;
  altText?: string;
}

export const OnboardingIllustration: React.FC<OnboardingIllustrationProps> = ({
  imageSrc = '/light/onboarding-welcome.webp',
  altText = 'Hockey Illustration',
}) => {
  return (
    <div className="illustration-panel" aria-label="Graphic illustration panel">
      <Image
        src={imageSrc}
        alt={altText}
        fill
        sizes="(min-width: 1440px) 676px, (min-width: 1024px) 48vw, 100vw"
        className="illustration-img"
        priority
      />
    </div>
  );
};
