'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/utils/cn';

export interface ImageCropModalProps {
  /** File to crop. The modal renders only while this is non-null. */
  file: File | null;
  /** `circle` locks aspect ratio to 1:1 and clips the preview to a circle (avatars). `rect` uses `aspectRatio`. */
  shape?: 'circle' | 'rect';
  /** Width / height ratio used when `shape` is `rect`. Defaults to 1 (square). */
  aspectRatio?: number;
  /** Output image MIME type. Defaults to `image/jpeg`. */
  outputType?: 'image/jpeg' | 'image/png' | 'image/webp';
  /** Output JPEG/WebP quality, 0-1. Defaults to 0.92. */
  outputQuality?: number;
  title?: string;
  onCancel: () => void;
  onCropComplete: (file: File) => void;
}

const VIEWPORT_WIDTH = 320;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const OUTPUT_SCALE = 2;

/**
 * Reusable image crop dialog: pan (drag) and zoom (slider) a selected image
 * inside a fixed viewport, then export the visible region as a new `File`.
 * Built on native Canvas/pointer events — no external cropping dependency,
 * per docs/THIRD_PARTY_AND_DEPENDENCY_POLICY.md's built-in-first rule.
 *
 * Dynamic pan/zoom/viewport geometry is applied via direct DOM style
 * mutation on refs (not a JSX style prop) — these are truly per-frame
 * runtime values Tailwind's static class generation cannot express, and
 * the repository's component-reuse check rejects inline style objects
 * outright. All other styling lives in `index.css` (`.mhn-crop-*` classes).
 *
 * Pair with `useImageCrop()` (`@/hooks/use-image-crop`) to insert cropping
 * into an existing `FilePickerButton` `onFilesSelected` handler with one
 * `await` and no other restructuring. See docs/COMPONENT_CATALOG.md.
 */
export function ImageCropModal({
  file,
  shape = 'rect',
  aspectRatio = 1,
  outputType = 'image/jpeg',
  outputQuality = 0.92,
  title = 'Adjust image',
  onCancel,
  onCropComplete,
}: Readonly<ImageCropModalProps>) {
  const effectiveAspectRatio = shape === 'circle' ? 1 : aspectRatio;
  const viewportHeight = VIEWPORT_WIDTH / effectiveAspectRatio;

  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const zoomRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const dragState = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number } | null>(null);

  const objectUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    if (!objectUrl) {
      setImageEl(null);
      return;
    }
    const img = new window.Image();
    img.onload = () => setImageEl(img);
    img.src = objectUrl;
    return () => URL.revokeObjectURL(objectUrl);
  }, [objectUrl]);

  const baseScale = imageEl
    ? Math.max(VIEWPORT_WIDTH / imageEl.naturalWidth, viewportHeight / imageEl.naturalHeight)
    : 1;

  const applyTransform = (zoom: number, offset: { x: number; y: number }) => {
    if (!imgRef.current || !imageEl) return;
    const scale = baseScale * zoom;
    const dispW = imageEl.naturalWidth * scale;
    const dispH = imageEl.naturalHeight * scale;
    imgRef.current.style.width = `${dispW}px`;
    imgRef.current.style.height = `${dispH}px`;
    imgRef.current.style.transform = `translate(${offset.x}px, ${offset.y}px)`;
  };

  const clampOffset = (zoom: number, x: number, y: number) => {
    if (!imageEl) return { x: 0, y: 0 };
    const scale = baseScale * zoom;
    const dispW = imageEl.naturalWidth * scale;
    const dispH = imageEl.naturalHeight * scale;
    return {
      x: Math.min(0, Math.max(VIEWPORT_WIDTH - dispW, x)),
      y: Math.min(0, Math.max(viewportHeight - dispH, y)),
    };
  };

  useEffect(() => {
    zoomRef.current = 1;
    offsetRef.current = { x: 0, y: 0 };
    if (viewportRef.current) {
      viewportRef.current.style.width = `${VIEWPORT_WIDTH}px`;
      viewportRef.current.style.height = `${viewportHeight}px`;
    }
    applyTransform(1, { x: 0, y: 0 });
  }, [imageEl]);

  if (!file) return null;

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    dragState.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: offsetRef.current.x,
      originY: offsetRef.current.y,
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragState.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const next = clampOffset(
      zoomRef.current,
      drag.originX + (event.clientX - drag.startX),
      drag.originY + (event.clientY - drag.startY),
    );
    offsetRef.current = next;
    applyTransform(zoomRef.current, next);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragState.current?.pointerId === event.pointerId) dragState.current = null;
  };

  const handleZoomChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextZoom = Number(event.target.value);
    zoomRef.current = nextZoom;
    const nextOffset = clampOffset(nextZoom, offsetRef.current.x, offsetRef.current.y);
    offsetRef.current = nextOffset;
    applyTransform(nextZoom, nextOffset);
  };

  const handleApply = async () => {
    if (!imageEl) return;
    setIsExporting(true);
    try {
      const scale = baseScale * zoomRef.current;
      const outW = Math.round(VIEWPORT_WIDTH * OUTPUT_SCALE);
      const outH = Math.round(viewportHeight * OUTPUT_SCALE);
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const sourceX = -offsetRef.current.x / scale;
      const sourceY = -offsetRef.current.y / scale;
      const sourceW = VIEWPORT_WIDTH / scale;
      const sourceH = viewportHeight / scale;
      ctx.drawImage(imageEl, sourceX, sourceY, sourceW, sourceH, 0, 0, outW, outH);

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, outputType, outputQuality),
      );
      if (!blob) return;

      const extension = outputType.split('/')[1] ?? 'jpg';
      const baseName = file.name.replace(/\.[^./\\]+$/, '') || 'image';
      const croppedFile = new File([blob], `${baseName}-cropped.${extension}`, { type: outputType });
      onCropComplete(croppedFile);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      open={Boolean(file)}
      onClose={onCancel}
      title={title}
      className="mhn-crop-modal-card"
      overlayClassName="mhn-crop-modal-overlay"
      closeOnOverlayClick={!isExporting}
      closeOnEscape={!isExporting}
    >
        <h2 className="mhn-crop-modal-title">{title}</h2>

        <div
          ref={viewportRef}
          className={cn('mhn-crop-viewport', shape === 'circle' && 'mhn-crop-viewport--circle')}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          {imageEl ? (
            // eslint-disable-next-line @next/next/no-img-element -- live crop preview driven by pan/zoom transform applied via ref, not a Next-optimizable static render
            <img ref={imgRef} src={objectUrl ?? undefined} alt="" draggable={false} className="mhn-crop-image" />
          ) : null}
        </div>

        <div className="mhn-crop-zoom-row">
          <span aria-hidden="true">−</span>
          <Slider
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            defaultValue={1}
            onChange={handleZoomChange}
            aria-label="Zoom"
            className="mhn-crop-zoom-slider"
          />
          <span aria-hidden="true">+</span>
        </div>

        <div className="mhn-crop-modal-actions">
          <Button type="button" variant="primary" onClick={handleApply} isLoading={isExporting} disabled={!imageEl}>
            Apply
          </Button>
          {/* Figma (2203:43222) "Back" button — reused here as Cancel per
              feedback 2026-08-29: Figma's own crop screen has no way back,
              but leaving the user with only Apply isn't friendly, so this
              adds the same outline-blue control below it. */}
          <Button type="button" variant="outline" onClick={onCancel} disabled={isExporting} className="mhn-crop-modal-back-btn">
            Cancel
          </Button>
        </div>
    </Modal>
  );
}
