import { apiFetch } from './client';
import { API_ENDPOINTS } from './urls';

export type UploadPurpose =
  | 'AVATAR'
  | 'COVER'
  | 'POST_IMAGE'
  | 'POST_VIDEO'
  | 'GROUP_FILE'
  | 'GROUP_LOGO'
  | 'ORGANIZATION_LOGO'
  | 'ASSOCIATION_LOGO';

export interface UploadSlotResponse {
  uploadUrl: string;
  method: string;
  headers: Record<string, string>;
  expiresIn: number;
  storageKey: string;
  mediaId?: string;
}

export interface UploadMediaResult {
  storageKey: string;
  mediaId?: string;
}

/**
 * Step 1 & Step 2 Media Upload Helper (as per media-uploads.md specification)
 * 1. POST /v1/media/upload-url -> { uploadUrl, storageKey, mediaId? }
 * 2. PUT <uploadUrl> -> raw file (without authorization header)
 * Returns { storageKey, mediaId? }
 */
export async function uploadMediaFile(
  file: File | Blob,
  purpose: UploadPurpose,
  clientType: 'web' | 'mobile' = 'web'
): Promise<UploadMediaResult> {
  const mimeType = file.type || 'image/png';
  const sizeBytes = file.size;

  // Step 1: Request an upload slot
  const res = await apiFetch<UploadSlotResponse | { data: UploadSlotResponse }>(
    API_ENDPOINTS.MEDIA.UPLOAD_URL,
    {
      method: 'POST',
      body: JSON.stringify({
        purpose,
        mimeType,
        sizeBytes,
      }),
    },
    clientType
  );

  const slot = 'data' in res ? res.data : res;
  if (!slot?.uploadUrl || !slot?.storageKey) {
    throw new Error('Failed to obtain media upload URL slot from backend server');
  }

  // Step 2: Upload raw bytes directly to storage (No Authorization header, PUT method)
  const uploadHeaders: Record<string, string> = {
    'Content-Type': mimeType,
    ...(slot.headers || {}),
  };

  const putResponse = await fetch(slot.uploadUrl, {
    method: slot.method || 'PUT',
    headers: uploadHeaders,
    body: file,
  });

  if (!putResponse.ok) {
    throw new Error(`Failed to upload media file to storage (${putResponse.status} ${putResponse.statusText})`);
  }

  return {
    storageKey: slot.storageKey,
    mediaId: slot.mediaId,
  };
}

/**
 * Complete media upload (Required for POST_IMAGE and POST_VIDEO)
 * POST /v1/media/{mediaId}/complete
 */
export async function completeMediaUpload(
  mediaId: string,
  clientType: 'web' | 'mobile' = 'web'
): Promise<{ mediaId: string; status: string }> {
  const res = await apiFetch<{ mediaId: string; status: string } | { data: { mediaId: string; status: string } }>(
    API_ENDPOINTS.MEDIA.COMPLETE(mediaId),
    {
      method: 'POST',
      body: JSON.stringify({}),
    },
    clientType
  );
  return 'data' in res ? res.data : res;
}
