import { afterEach, expect, it, vi } from 'vitest';
import { POST } from './route';
import { readWorkspace } from '@/lib/storage';
import { copyResume, emptyRecord, emptyWorkspace } from '@/lib/types';
vi.mock('@/lib/storage', () => ({ readWorkspace: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.clearAllMocks(); });
const call = (origin = 'http://localhost:3000', body = '{}') => POST(new Request('http://localhost:3000/api/resumes/r/review', { method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body }), { params: Promise.resolve({ id: 'r' }) });
it('rejects cross-origin requests before accessing data or the provider', async () => {
  expect((await call('https://untrusted.example')).status).toBe(403); expect(readWorkspace).not.toHaveBeenCalled();
});
it('reports missing configuration without exposing credentials', async () => {
  vi.stubEnv('OPENROUTER_API_KEY', ''); expect((await call()).status).toBe(503);
});
it('validates a provider response and sends only the visible writing', async () => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-secret');
  const workspace = emptyWorkspace(), record = emptyRecord(); record.basics.email = 'private@example.com'; workspace.resumes.push(copyResume(record, workspace, 'r', 'Name'));
  vi.mocked(readWorkspace).mockResolvedValue(workspace);
  const fetch = vi.fn().mockResolvedValue(Response.json({ model: 'test/model', choices: [{ message: { content: JSON.stringify({ score: 70, overview: 'Useful feedback', strengths: [], findings: [], summaryRewrite: '' }) } }] })); vi.stubGlobal('fetch', fetch);
  const response = await call(); expect(response.status).toBe(200); expect((await response.json()).review.score).toBe(70);
  expect(fetch.mock.calls[0][1].body).not.toContain('private@example.com');
});
it('does not relay provider error bodies or credentials', async () => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-secret'); const workspace = emptyWorkspace(); workspace.resumes.push(copyResume(emptyRecord(), workspace, 'r', 'Name')); vi.mocked(readWorkspace).mockResolvedValue(workspace);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('test-secret upstream details', { status: 500 })));
  const response = await call(); expect(response.status).toBe(502); expect(await response.text()).not.toContain('test-secret');
});
it('accepts the browser loopback host even when Next normalizes its internal URL', async () => {
  vi.stubEnv('OPENROUTER_API_KEY', '');
  const request = new Request('http://localhost:3000/api/resumes/r/review', { method: 'POST', headers: { origin: 'http://127.0.0.1:3000', host: '127.0.0.1:3000', 'Content-Type': 'application/json' }, body: '{}' });
  expect((await POST(request, { params: Promise.resolve({ id: 'r' }) })).status).toBe(503);
});
it('rejects non-loopback hostnames that could point at the local app', async () => {
  const request = new Request('http://untrusted.example:3000/api/resumes/r/review', { method: 'POST', headers: { origin: 'http://untrusted.example:3000', host: 'untrusted.example:3000', 'Content-Type': 'application/json' }, body: '{}' });
  expect((await POST(request, { params: Promise.resolve({ id: 'r' }) })).status).toBe(403);
});

it('generates grounded skill additions on demand and rejects fabricated tools', async () => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-secret');
  const workspace = emptyWorkspace(), resume = copyResume(emptyRecord(), workspace, 'r', 'Name');
  resume.summary.en = 'Built interfaces with TypeScript.'; workspace.resumes.push(resume);
  vi.mocked(readWorkspace).mockResolvedValue(workspace);
  const finding = { section: 'skills', title: 'Missing skills', detail: 'List demonstrated skills.', suggestion: 'Add relevant skills.', priority: 'high' };
  const result = (name: string) => Response.json({ choices: [{ message: { content: JSON.stringify({ score: 70, overview: 'Review', strengths: [], findings: [{ ...finding, addSkills: [{ name, evidence: 'Built interfaces with TypeScript.' }] }] }) } }] });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(result('TypeScript')).mockResolvedValueOnce(result('React')));
  const response = await call('http://localhost:3000', JSON.stringify({ finding }));
  expect(response.status).toBe(200);
  expect((await response.json()).review.findings[0].addSkills[0].name).toBe('TypeScript');
  const unsupported = await call('http://localhost:3000', JSON.stringify({ finding }));
  expect(unsupported.status).toBe(200); expect((await unsupported.json()).unavailable).toBe(true);
});

it('omits speculative findings without applicable changes from new reviews', async () => {
  vi.stubEnv('OPENROUTER_API_KEY', 'test-secret');
  const workspace = emptyWorkspace(); workspace.resumes.push(copyResume(emptyRecord(), workspace, 'r', 'Name')); vi.mocked(readWorkspace).mockResolvedValue(workspace);
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ choices: [{ message: { content: JSON.stringify({ score: 70, overview: 'Review', strengths: [], findings: [{ section: 'experience', title: 'Show progression', detail: 'Dates differ.', suggestion: 'Claim broader responsibility.', priority: 'medium', edits: [] }] }) } }] })));
  const response = await call(); expect((await response.json()).review.findings).toEqual([]);
});
