import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/api/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
  serverExternalPackages: ['@sparticuz/chromium'],
  outputFileTracingIncludes: { '/api/resumes/*/pdf': ['node_modules/@sparticuz/chromium/bin/**', 'node_modules/playwright-core/browsers.json', 'public/fonts/noto-sans-arabic.ttf'] },
  outputFileTracingExcludes: { '/*': ['data/**', '.env*', '.next-build/**', 'captures/**', 'llms.txt/**'] },
  cacheComponents: true,
  partialPrefetching: true,
  distDir: process.env.CAREERY_BUILD_DIR ?? '.next',
  experimental: { agentUpgrade: "security", exposeTestingApiInProductionBuild: process.env.CAREERY_INSTANT_TEST === '1' },
};
export default nextConfig;
