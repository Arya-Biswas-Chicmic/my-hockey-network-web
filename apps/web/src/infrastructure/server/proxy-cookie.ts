/** Re-scope a backend cookie to the browser-facing Next.js origin. */
export function rewriteSetCookieForSameOrigin(cookie: string): string {
  const attributes = cookie
    .split(';')
    .map((attribute) => attribute.trim())
    .filter((attribute) => !/^domain=/i.test(attribute) && !/^path=/i.test(attribute));

  const [nameValue, ...rest] = attributes;
  return [nameValue, 'Path=/', ...rest].filter(Boolean).join('; ');
}
