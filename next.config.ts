import type { NextConfig } from 'next';
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  distDir: process.env.CAREERY_BUILD_DIR ?? '.next',
  experimental: { exposeTestingApiInProductionBuild: process.env.CAREERY_INSTANT_TEST === '1' },
};
export default nextConfig;
