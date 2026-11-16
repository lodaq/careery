import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.CAREERY_SITE_URL;
  return siteUrl ? ['/', '/resources'].map(path => ({ url: new URL(path, siteUrl).href })) : [];
}
