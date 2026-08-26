import { describe, expect, it } from 'vitest';

import { rewriteSetCookieForSameOrigin } from '@/infrastructure/server/proxy-cookie';

describe('same-origin proxy cookie rewriting', () => {
  it('removes the backend domain and scopes the cookie to the web origin', () => {
    expect(
      rewriteSetCookieForSameOrigin(
        'mhn_session=secret; Domain=api.example.com; Path=/v1; HttpOnly; Secure; SameSite=Lax',
      ),
    ).toBe('mhn_session=secret; Path=/; HttpOnly; Secure; SameSite=Lax');
  });

  it('preserves cookie values and security attributes', () => {
    expect(rewriteSetCookieForSameOrigin('csrf=a=b=c; HttpOnly; Secure')).toBe(
      'csrf=a=b=c; Path=/; HttpOnly; Secure',
    );
  });
});
