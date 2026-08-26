'use client';

import { useRef, useState } from 'react';

import { ImageCropModal, type ImageCropModalProps } from '@/components/ui/image-crop-modal';

export type CropOptions = Pick<
  ImageCropModalProps,
  'shape' | 'aspectRatio' | 'outputType' | 'outputQuality' | 'title'
>;

export interface UseImageCropResult {
  /**
   * Opens the crop modal for `file` and resolves with the cropped `File`,
   * or `null` if the user cancels. Insert into an existing file-select
   * handler with one `await`:
   *
   * ```tsx
   * const { cropImage, cropModal } = useImageCrop();
   * const handleAvatarFileChange = async (files: File[]) => {
   *   const cropped = await cropImage(files[0], { shape: 'circle', title: 'Adjust photo' });
   *   if (!cropped) return; // user cancelled
   *   // ...existing validation/upload logic using `cropped` instead of the raw file
   * };
   * return <>{cropModal}...</>;
   * ```
   */
  cropImage: (file: File, options?: CropOptions) => Promise<File | null>;
  /** Render this once, anywhere in the component tree, alongside the trigger. */
  cropModal: React.ReactNode;
}

/**
 * Shared avatar/cover/post-image cropping. See docs/COMPONENT_CATALOG.md
 * "Media/image components" for which upload flows use this and why.
 */
export function useImageCrop(): UseImageCropResult {
  const [file, setFile] = useState<File | null>(null);
  const [options, setOptions] = useState<CropOptions>({});
  const resolverRef = useRef<((result: File | null) => void) | null>(null);

  const cropImage = (nextFile: File, nextOptions: CropOptions = {}) =>
    new Promise<File | null>((resolve) => {
      resolverRef.current = resolve;
      setOptions(nextOptions);
      setFile(nextFile);
    });

  const settle = (result: File | null) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setFile(null);
  };

  const cropModal = (
    <ImageCropModal
      file={file}
      {...options}
      onCancel={() => settle(null)}
      onCropComplete={(cropped) => settle(cropped)}
    />
  );

  return { cropImage, cropModal };
}
