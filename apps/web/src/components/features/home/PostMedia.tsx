import React, { useRef, useState } from 'react';
import { FallbackImage } from '@/components/ui/fallback-image';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { showInfoToast, showSuccessToast } from '@/utils/toast';

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
  const trackRef = useRef<HTMLDivElement | null>(null);
  // Event posts get a Register CTA next to the date banner (feedback
  // 2026-08-29: "event feeds{option to register}"). No registration backend
  // exists yet, so this is a local toggle + toast, the same pattern
  // `PostCardActions`'s Save button already uses for a demo-mode action.
  const [isRegistered, setIsRegistered] = useState(false);

  if (mediaList.length === 0) return null;

  const isMultiple = mediaList.length > 1;

  // Scroll-snap carousel — feedback 2026-08-29: "add slider option to slide
  // image by scrolling". Native horizontal scroll/swipe (trackpad two-finger
  // swipe, touch drag, shift+wheel) drives `activeIndex` here rather than a
  // custom wheel-event listener, specifically so it never fights the feed's
  // own vertical scroll the way hijacking `onWheel` would.
  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };

  // Not rAF-throttled — this is a Math.round on values the scroll event
  // already carries, cheap enough to run on every event, and correctness
  // (the badge/dots never lagging behind a fast swipe) matters more than
  // shaving the rare redundant re-render (same reasoning as the infinite-
  // scroll sentinel's own scroll handler, `use-infinite-scroll-sentinel.ts`).
  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const width = track.clientWidth || 1;
    const index = Math.round(track.scrollLeft / width);
    setActiveIndex(Math.min(Math.max(index, 0), mediaList.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    scrollToIndex((activeIndex + 1) % mediaList.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    scrollToIndex((activeIndex - 1 + mediaList.length) % mediaList.length);
  };

  return (
    <div className="mhn-post-media-container relative group overflow-hidden bg-slate-900/60">
      {isMultiple && (
        <div className="mhn-media-badge absolute top-3 right-3 z-10 rounded-full bg-black/60 backdrop-blur-md px-2.5 py-1 text-xs font-semibold text-white tracking-wide border border-white/10">
          {activeIndex + 1}/{mediaList.length}
        </div>
      )}

      <div
        ref={trackRef}
        onScroll={handleTrackScroll}
        className="mhn-post-media-scroll-track flex w-full aspect-[16/9] overflow-x-auto snap-x snap-mandatory"
      >
        {mediaList.map((src, idx) => (
          <div key={src} className="mhn-post-media-slide shrink-0 w-full h-full snap-start">
            <FallbackImage
              src={src}
              alt={`${altText} ${isMultiple ? idx + 1 : ''}`}
              width={800}
              height={450}
              hideOnError
              className="mhn-post-media-img w-full h-full object-cover"
            />
          </div>
        ))}
      </div>

      {eventDateTag && (
        <div className="mhn-post-event-banner absolute bottom-0 left-0 right-0 flex items-center justify-between gap-3 bg-[#071325]/90 backdrop-blur-md py-2.5 px-4 border-t border-[#162742] z-10">
          <span className="text-[#168BFF] font-semibold text-xs tracking-wider uppercase truncate">{eventDateTag}</span>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              // Bug fix 2026-08-29: the toast calls used to live inside the
              // `setIsRegistered(prev => ...)` updater function — React can
              // invoke that updater during its render phase, and the toast
              // call is a side effect (another component's setState), which
              // threw "Cannot update a component (Providers) while
              // rendering a different component (PostMedia)". State
              // updaters must stay pure; read `isRegistered` directly and
              // fire the toast in the handler body instead, not the updater.
              const next = !isRegistered;
              setIsRegistered(next);
              if (next) showSuccessToast("You're registered for this event.");
              else showInfoToast('Registration cancelled.');
            }}
            className={`mhn-post-event-register-btn flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
              isRegistered
                ? 'bg-transparent border border-[#168BFF] text-[#168BFF]'
                : 'bg-[#168BFF] text-white hover:bg-[#1478D9]'
            }`}
            aria-label={isRegistered ? 'Registered for event' : 'Register for event'}
          >
            {isRegistered && <Check size={13} aria-hidden="true" />}
            {isRegistered ? 'Registered' : 'Register'}
          </Button>
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
                onClick={() => scrollToIndex(idx)}
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
