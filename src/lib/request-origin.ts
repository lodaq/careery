/** Allows local development and the configured production origin, never arbitrary hosts. */
export function sameOrigin(request: Request) {
  try {
    const url = new URL(request.url);
    const origin = new URL(request.headers.get('origin') ?? '').origin;
    const expected = new URL(`${url.protocol}//${request.headers.get('host') || url.host}`);
    return origin === expected.origin && (
      ['localhost', '127.0.0.1', '[::1]'].includes(expected.hostname) ||
      (expected.protocol === 'https:' && expected.origin === process.env.CAREERY_SITE_URL)
    );
  } catch { return false; }
}
