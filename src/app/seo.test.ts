import { afterEach, expect, it, vi } from 'vitest';
import sitemap from './sitemap';
import robots from './robots';

afterEach(() => vi.unstubAllEnvs());
it('lists only public pages using the configured production origin', () => {
  vi.stubEnv('CAREERY_SITE_URL', 'https://careery.example');
  expect(sitemap().map(entry => entry.url)).toEqual(['https://careery.example/', 'https://careery.example/resources']);
  expect(robots().sitemap).toBe('https://careery.example/sitemap.xml');
});
it('does not publish invented URLs without a production origin', () => {
  vi.stubEnv('CAREERY_SITE_URL', '');
  expect(sitemap()).toEqual([]);
  expect(robots().sitemap).toBeUndefined();
});
