import { expect, it, vi } from 'vitest';
import { sameOrigin } from './request-origin';
it('accepts only matching local or configured HTTPS origins', () => {
  vi.stubEnv('CAREERY_SITE_URL', 'https://careery.example');
  try {
    const request = (url: string, origin: string) => new Request(url, { headers: { origin } });
    expect(sameOrigin(request('https://careery.example/api/backup', 'https://careery.example'))).toBe(true);
    expect(sameOrigin(request('http://localhost:3000/api/backup', 'http://localhost:3000'))).toBe(true);
    expect(sameOrigin(request('https://careery.example/api/backup', 'https://attacker.example'))).toBe(false);
    expect(sameOrigin(request('https://attacker.example/api/backup', 'https://attacker.example'))).toBe(false);
  } finally { vi.unstubAllEnvs(); }
});
