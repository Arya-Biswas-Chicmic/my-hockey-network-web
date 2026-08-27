import React from 'react';
import Image from 'next/image';

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
      <Image
        src={imageSrc}
        alt={altText}
        fill
        sizes="(min-width: 768px) 490px, 100vw"
        className="illustration-img"
        priority
      />
    </div>
  );
};
