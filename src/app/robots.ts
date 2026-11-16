import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    ...(process.env.CAREERY_SITE_URL ? { sitemap: new URL('/sitemap.xml', process.env.CAREERY_SITE_URL).href } : {}),
  };
}
