import { expect, it, vi } from 'vitest';
import { fetchJobs, parseJob } from './job-data';
const job = { id: 1, url: 'https://jobicy.com/jobs/1-developer', jobTitle: 'Software developer', companyName: 'Example', jobGeo: 'Anywhere', pubDate: '2026-11-16T12:00:00Z' };
it('only accepts explicit eligible locations and safe source links', () => {
  expect(parseJob(job)?.category).toBe('Software engineering');
  for (const jobGeo of ['USA', 'Remote', 'EMEA', 'Anywhere (US only)']) expect(parseJob({ ...job, jobGeo })).toBeNull();
  expect(parseJob({ ...job, jobGeo: 'Egypt, Jordan' })).not.toBeNull();
  expect(parseJob({ ...job, url: 'javascript:alert(1)' })).toBeNull();
  expect(parseJob({ ...job, pubDate: 'invalid' })).toBeNull();
  expect(parseJob({ ...job, jobTitle: 'Accountant' })).toBeNull();
});
it.each([['University lecturer', 'School & university teaching'], ['Online tutor', 'Online tutoring'], ['Instructional designer', 'Instructional design'], ['Corporate trainer', 'Corporate training']])('classifies %s', (jobTitle, category) => {
  expect(parseJob({ ...job, jobTitle })?.category).toBe(category);
});
it('follows opaque cursors, deduplicates and filters all pages', async () => {
  const request = vi.fn().mockResolvedValueOnce(Response.json({ jobs: [job], nextCursor: 'opaque' })).mockResolvedValueOnce(Response.json({ jobs: [job, { ...job, id: 2, jobGeo: 'USA' }], nextCursor: null }));
  const result = await fetchJobs(request);
  expect(result.jobs).toHaveLength(1);
  expect(request.mock.calls[1][0]).toContain('cursor=opaque');
});
it('rejects source errors and repeated cursors instead of publishing incomplete data', async () => {
  await expect(fetchJobs(vi.fn().mockResolvedValue(new Response('', { status: 429 })))).rejects.toThrow();
  await expect(fetchJobs(vi.fn().mockImplementation(async () => Response.json({ jobs: [], nextCursor: 'same' })))).rejects.toThrow('Repeated');
});
