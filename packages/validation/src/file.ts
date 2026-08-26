import { z } from 'zod';

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const IMAGE_ACCEPT = IMAGE_MIME_TYPES.join(',');
export const PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export interface FileSchemaOptions {
  acceptedTypes?: readonly string[];
  maxBytes?: number;
  required?: boolean;
}

export function createFileSchema({
  acceptedTypes = IMAGE_MIME_TYPES,
  maxBytes = PROFILE_IMAGE_MAX_BYTES,
  required = true,
}: FileSchemaOptions = {}) {
  const fileSchema = z
    .custom<File>((value) => typeof File !== 'undefined' && value instanceof File, 'Select a valid file.')
    .refine((file) => acceptedTypes.includes(file.type), 'This file type is not supported.')
    .refine((file) => file.size <= maxBytes, `File must be ${Math.floor(maxBytes / 1024 / 1024)}MB or smaller.`);

  return required ? fileSchema : fileSchema.optional();
}
