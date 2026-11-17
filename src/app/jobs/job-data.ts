export const categories = ['Software engineering', 'School & university teaching', 'Online tutoring', 'Instructional design', 'Corporate training'] as const;
export type Job = { id: number; url: string; title: string; company: string; location: string; category: typeof categories[number]; published: string };

export function parseJob(value: unknown): Job | null {
  if (!value || typeof value !== 'object') return null;
  const j = value as Record<string, unknown>;
  if (!Number.isSafeInteger(j.id) || Number(j.id) <= 0 || !['url', 'jobTitle', 'companyName', 'jobGeo', 'pubDate'].every(k => typeof j[k] === 'string' && (j[k] as string).length > 0)) return null;
  let url: URL;
  try { url = new URL(j.url as string); } catch { return null; }
  if (url.protocol !== 'https:' || url.hostname !== 'jobicy.com' || !url.pathname.startsWith('/jobs/') || url.username || url.password || url.port) return null;
  if (!Number.isFinite(Date.parse(j.pubDate as string))) return null;
  const location = (j.jobGeo as string).trim();
  if (!/^(anywhere|worldwide|world wide|global|egypt)$/i.test(location) && !location.split(/[,;/|]/).some(p => p.trim().toLowerCase() === 'egypt')) return null;
  const title = j.jobTitle as string;
  const category = /instructional|curriculum|learning designer/i.test(title) ? categories[3]
    : /tutor/i.test(title) ? categories[2]
    : /corporate train|trainer|learning and development|learning & development/i.test(title) ? categories[4]
    : /teacher|teaching|professor|lecturer|instructor|educator/i.test(title) ? categories[1]
    : /software|developer|frontend|front.end|backend|back.end|full.stack|devops|site reliability|qa engineer|test engineer|mobile engineer|platform engineer/i.test(title) ? categories[0] : null;
  return category ? { id: Number(j.id), url: url.href, title, company: j.companyName as string, location, category, published: j.pubDate as string } : null;
}

export async function fetchJobs(request: typeof fetch = fetch) {
  const jobs = new Map<number, Job>();
  const cursors = new Set<string>();
  let cursor: string | null = null;
  do {
    const params = new URLSearchParams({ count: '100' });
    if (cursor) params.set('cursor', cursor);
    const response = await request(`https://jobicy.com/api/jobs?${params}`, { signal: AbortSignal.timeout(15000), headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error('Job source unavailable');
    const data = await response.json();
    if (data.success === false || !Array.isArray(data.jobs) || (data.nextCursor !== null && typeof data.nextCursor !== 'string')) throw new Error('Invalid job feed');
    for (const item of data.jobs) { const job = parseJob(item); if (job) jobs.set(job.id, job); }
    cursor = data.nextCursor;
    if (cursor && cursors.has(cursor)) throw new Error('Repeated job cursor');
    if (cursor) cursors.add(cursor);
    // shortcut: cap unexpectedly large feeds at 50 pages; add incremental synchronization if the source grows beyond this.
    if (cursor && cursors.size >= 50) throw new Error('Job feed exceeds request budget');
  } while (cursor);
  return { jobs: [...jobs.values()].sort((a, b) => Date.parse(b.published) - Date.parse(a.published)), checkedAt: new Date().toISOString() };
}
