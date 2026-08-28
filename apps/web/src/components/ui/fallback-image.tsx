'use client';

import { useState, useEffect } from 'react';
import Image, { type ImageProps } from 'next/image';
import { isRenderableImageUrl } from '@/utils/mediaUtils';

const DEFAULT_FALLBACK = '/userPlaceholder.webp';

export interface FallbackImageProps extends Omit<ImageProps, 'src' | 'alt' | 'onError'> {
  src?: string | null;
  alt: string;
  /** Shown when `src` is empty or fails to load. Defaults to the shared placeholder avatar. */
  fallbackSrc?: string;
  /** Render nothing on load failure instead of swapping to `fallbackSrc`. */
  hideOnError?: boolean;
}

/**
 * Reusable remote/uploaded image (avatar, cover, post attachment, event
 * banner, ...) that automatically swaps to a fallback image on an empty or
 * failed `src`, replacing the old per-call-site `onError` DOM mutation
 * pattern (`(e.target as HTMLImageElement).src = '...'`).
 *
 * Existing image CSS classes in this codebase size the element in pixels
 * (`width`/`height` in the stylesheet), so pass matching `width`/`height`
 * props for a standard render, or `fill` when the call site already has a
 * `position: relative` sized wrapper. See docs/COMPONENT_CATALOG.md.
 *
 * `src` is also validated against what `next.config.js`'s image
 * `remotePatterns` actually allows (any `https://` host, or a local `/`
 * path) before ever reaching `next/image` — an unconfigured host (e.g. a
 * stray `http://` URL) makes `<Image>` throw synchronously at render, which
 * `onError` can never catch since the image never gets a chance to load.
 * Treated the same as an empty `src`: falls straight to `fallbackSrc`.
 */
export function FallbackImage({
  src,
  alt,
  fallbackSrc = DEFAULT_FALLBACK,
  hideOnError = false,
  ...imageProps
}: Readonly<FallbackImageProps>) {
  const hasSrc = Boolean(src && src.trim() && isRenderableImageUrl(src.trim()));
  const [currentSrc, setCurrentSrc] = useState(hasSrc ? (src as string) : fallbackSrc);
  const [failed, setFailed] = useState(hideOnError && !hasSrc);

  useEffect(() => {
    setCurrentSrc(hasSrc ? (src as string) : fallbackSrc);
    setFailed(hideOnError && !hasSrc);
  }, [src, hasSrc, fallbackSrc, hideOnError]);

  if (hideOnError && (failed || !hasSrc)) return null;

  return (
    <Image
      {...imageProps}
      src={currentSrc}
      alt={alt}
      onError={() => {
        if (hideOnError) {
          setFailed(true);
        } else if (currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
    />
  );
}
