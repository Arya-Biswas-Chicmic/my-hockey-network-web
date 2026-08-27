import { describe, expect, it } from 'vitest';
import { resolveMediaUrl, resolveCoverUrl, isRenderableImageUrl } from '@/utils/mediaUtils';

describe('resolveMediaUrl', () => {
  it('returns the trimmed url when it is a real value', () => {
    expect(resolveMediaUrl(' https://example.com/avatar.png ')).toBe('https://example.com/avatar.png');
  });

  it('falls back for a non-https absolute URL — regression test for a real crash where a stale ' +
    '"http://localhost:3000/..." avatar URL (left over from local dev media-storage testing) made ' +
    'next/image throw synchronously at render (next.config.js only allows https remote hosts), ' +
    'taking down the whole authenticated shell', () => {
    expect(resolveMediaUrl('http://localhost:3000/v1/media/local/avatars/x.jpg')).toBe('/userPlaceholder.png');
    expect(resolveMediaUrl('http://example.com/avatar.png')).toBe('/userPlaceholder.png');
  });

  it('allows a local relative path through unchanged (not subject to remotePatterns)', () => {
    expect(resolveMediaUrl('/uploads/avatar.png')).toBe('/uploads/avatar.png');
  });

  it('falls back to the default placeholder for null/undefined/empty input', () => {
    expect(resolveMediaUrl(null)).toBe('/userPlaceholder.png');
    expect(resolveMediaUrl(undefined)).toBe('/userPlaceholder.png');
    expect(resolveMediaUrl('')).toBe('/userPlaceholder.png');
    expect(resolveMediaUrl('   ')).toBe('/userPlaceholder.png');
  });

  it('treats the literal strings "null"/"undefined" as missing (a defensive guard against stringified nulls)', () => {
    expect(resolveMediaUrl('null')).toBe('/userPlaceholder.png');
    expect(resolveMediaUrl('undefined')).toBe('/userPlaceholder.png');
  });

  it('uses a caller-supplied fallback instead of the default when given one', () => {
    expect(resolveMediaUrl(null, '/HC.png')).toBe('/HC.png');
    expect(resolveMediaUrl(undefined, '/kcBlue.png')).toBe('/kcBlue.png');
  });
});

describe('resolveCoverUrl', () => {
  it('returns the trimmed url when it is a real value', () => {
    expect(resolveCoverUrl(' https://example.com/cover.png ')).toBe('https://example.com/cover.png');
  });

  it('falls back to the default cover placeholder for null/undefined/empty input', () => {
    expect(resolveCoverUrl(null)).toBe('/cover.png');
    expect(resolveCoverUrl(undefined)).toBe('/cover.png');
    expect(resolveCoverUrl('')).toBe('/cover.png');
  });

  it('treats the literal strings "null"/"undefined" as missing', () => {
    expect(resolveCoverUrl('null')).toBe('/cover.png');
    expect(resolveCoverUrl('undefined')).toBe('/cover.png');
  });

  it('falls back when the url contains "placeholder" case-insensitively (unlike resolveMediaUrl, which allows it) — regression test for a real bug where the app\'s actual "/userPlaceholder.png" path never matched a case-sensitive check', () => {
    expect(resolveCoverUrl('/some-placeholder-path.png')).toBe('/cover.png');
    expect(resolveCoverUrl('/userPlaceholder.png')).toBe('/cover.png');
    expect(resolveMediaUrl('/userPlaceholder.png')).toBe('/userPlaceholder.png');
  });

  it('uses a caller-supplied fallback instead of the default when given one', () => {
    expect(resolveCoverUrl(null, '/kcBlue.png')).toBe('/kcBlue.png');
  });

  it('falls back for a non-https absolute URL, same as resolveMediaUrl', () => {
    expect(resolveCoverUrl('http://localhost:3000/v1/media/local/covers/x.jpg')).toBe('/cover.png');
  });
});

describe('isRenderableImageUrl', () => {
  it('accepts https and local-relative URLs', () => {
    expect(isRenderableImageUrl('https://example.com/x.png')).toBe(true);
    expect(isRenderableImageUrl('HTTPS://example.com/x.png')).toBe(true);
    expect(isRenderableImageUrl('/local/path.png')).toBe(true);
  });

  it('rejects http and other schemes that next.config.js\'s https-only remotePatterns would reject', () => {
    expect(isRenderableImageUrl('http://localhost:3000/x.jpg')).toBe(false);
    expect(isRenderableImageUrl('ftp://example.com/x.png')).toBe(false);
    expect(isRenderableImageUrl('data:image/png;base64,abc')).toBe(false);
  });
});
