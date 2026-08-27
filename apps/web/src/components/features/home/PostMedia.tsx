import React, { useState } from 'react';
import { FallbackImage } from '@/components/ui/fallback-image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';

export interface PostMediaProps {
  images?: string[];
  postImage?: string;
  altText?: string;
}

export const PostMedia: React.FC<PostMediaProps> = ({
  images,
  postImage,
  altText = 'Post attachment',
}) => {
  const mediaList: string[] = images && images.length > 0 ? images : postImage ? [postImage] : [];
  const [activeIndex, setActiveIndex] = useState(0);

  if (mediaList.length === 0) return null;

  const currentImage = mediaList[activeIndex] || mediaList[0];
  const isMultiple = mediaList.length > 1;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % mediaList.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  return (
    <div className="mhn-post-media-container relative group overflow-hidden rounded-xl bg-slate-900/60">
      {isMultiple && (
        <div className="mhn-media-badge absolute top-3 right-3 z-10 rounded-full bg-slate-950/70 px-2.5 py-0.5 text-xs font-semibold text-white tracking-wide backdrop-blur-md">
          {activeIndex + 1}/{mediaList.length}
        </div>
      )}

      <FallbackImage
        src={currentImage}
        alt={`${altText} ${isMultiple ? activeIndex + 1 : ''}`}
        width={800}
        height={450}
        hideOnError
        className="mhn-post-media-img w-full object-cover rounded-xl"
      />

      {isMultiple && (
        <>
          <Button
            onClick={handlePrev}
            className="mhn-media-nav-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </Button>

          <Button
            onClick={handleNext}
            className="mhn-media-nav-next absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </Button>

          <div className="mhn-media-dots absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {mediaList.map((_, idx) => (
              <Button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === activeIndex ? 'w-4 bg-blue-500' : 'w-1.5 bg-white/50'
                }`}
                aria-label={`Go to image ${idx + 1}`}
              >
                <span className="sr-only">{`Go to image ${idx + 1}`}</span>
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
