import { describe, expect, it } from 'vitest';
import { resolveMediaUrl, resolveCoverUrl } from '@/utils/mediaUtils';

describe('resolveMediaUrl', () => {
  it('returns the trimmed url when it is a real value', () => {
    expect(resolveMediaUrl(' https://example.com/avatar.png ')).toBe('https://example.com/avatar.png');
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
});
