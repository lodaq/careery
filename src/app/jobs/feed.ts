import { cacheLife } from 'next/cache';
import { fetchJobs } from './job-data';

export async function readJobFeed() {
  'use cache';
  cacheLife({ stale: 0, revalidate: 3600, expire: 86400 });
  return fetchJobs();
}
