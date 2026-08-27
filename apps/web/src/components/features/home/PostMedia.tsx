import React, { useState } from 'react';
import { FallbackImage } from '@/components/ui/fallback-image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/common/Button';

export interface PostMediaProps {
  images?: string[];
  postImage?: string;
  altText?: string;
  eventDateTag?: string;
}

export const PostMedia: React.FC<PostMediaProps> = ({
  images,
  postImage,
  altText = 'Post attachment',
  eventDateTag,
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
    <div className="mhn-post-media-container relative group overflow-hidden rounded-xl bg-slate-900/60 border border-[#162742]">
      {isMultiple && (
        <div className="mhn-media-badge absolute top-3 right-3 z-10 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white tracking-wide border border-white/10">
          {activeIndex + 1}/{mediaList.length}
        </div>
      )}

      <FallbackImage
        src={currentImage}
        alt={`${altText} ${isMultiple ? activeIndex + 1 : ''}`}
        width={800}
        height={450}
        hideOnError
        className="mhn-post-media-img w-full aspect-[16/9] object-cover rounded-xl"
      />

      {eventDateTag && (
        <div className="absolute bottom-0 left-0 right-0 bg-[#071325]/90 backdrop-blur-md text-[#168BFF] font-semibold text-xs py-2.5 px-4 tracking-wider uppercase border-t border-[#162742] z-10">
          {eventDateTag}
        </div>
      )}

      {isMultiple && (
        <>
          <Button
            onClick={handlePrev}
            className="mhn-media-nav-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft size={18} />
          </Button>

          <Button
            onClick={handleNext}
            className="mhn-media-nav-next absolute right-2 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight size={18} />
          </Button>

          <div className="mhn-media-dots absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 items-center">
            {mediaList.map((_, idx) => (
              <Button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`rounded-full transition-all ${
                  idx === activeIndex ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/40'
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

