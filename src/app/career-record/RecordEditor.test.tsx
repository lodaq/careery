// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { emptyRecord } from '../../lib/types';
import { RecordEditor } from './RecordEditor';

afterEach(() => { cleanup(); vi.useRealTimers(); });
it('automatically saves the edited bilingual form after the debounce', async () => {
  vi.useFakeTimers();
  const save = vi.fn<(form: FormData) => Promise<{ revision: string }>>().mockResolvedValue({ revision: 'second' });
  render(<RecordEditor record={emptyRecord()} revision="first" saveAction={save} />);
  fireEvent.change(screen.getByLabelText('Name · English'), { target: { value: 'New name' } });
  fireEvent.change(screen.getByLabelText('Name · Arabic (optional)'), { target: { value: 'اسم' } });
  await act(async () => { await vi.advanceTimersByTimeAsync(650); });
  expect(save).toHaveBeenCalledTimes(1);
  const form: FormData = save.mock.calls[0]?.[0];
  expect(form.get('name.en')).toBe('New name');
  expect(form.get('name.ar')).toBe('اسم');
  expect(screen.getByRole('status').textContent).toBe('Saved');
});
it('saves newer edits after an in-flight write and uses the new revision', async () => {
  vi.useFakeTimers();
  let finish: (value: { revision: string }) => void = () => { throw new Error('Save not started'); };
  const save = vi.fn<(form: FormData) => Promise<{ revision: string }>>()
    .mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; }))
    .mockResolvedValue({ revision: 'third' });
  render(<RecordEditor record={emptyRecord()} revision="first" saveAction={save} />);
  fireEvent.change(screen.getByLabelText('Name · English'), { target: { value: 'First edit' } });
  await act(async () => { await vi.advanceTimersByTimeAsync(650); });
  fireEvent.change(screen.getByLabelText('Name · English'), { target: { value: 'Latest edit' } });
  expect(screen.getByRole('status').textContent).not.toBe('Saved');
  await act(async () => { finish({ revision: 'second' }); });
  expect(save).toHaveBeenCalledTimes(2);
  expect(save.mock.calls[1][0].get('name.en')).toBe('Latest edit');
  expect(save.mock.calls[1][0].get('_revision')).toBe('second');
  expect(screen.getByRole('status').textContent).toBe('Saved');
});
it('retains edits after a failed write and retries successfully', async () => {
  vi.useFakeTimers();
  const save = vi.fn<(form: FormData) => Promise<{ revision?: string; error?: string }>>()
    .mockResolvedValueOnce({ error: 'Disk unavailable. Retry.' }).mockResolvedValue({ revision: 'second' });
  render(<RecordEditor record={emptyRecord()} revision="first" saveAction={save} />);
  const input = screen.getByLabelText<HTMLInputElement>('Name · English');
  fireEvent.change(input, { target: { value: 'Keep this edit' } });
  await act(async () => { await vi.advanceTimersByTimeAsync(650); });
  expect(screen.getByRole('status').textContent).toContain('Disk unavailable');
  expect(input.value).toBe('Keep this edit');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Save now / retry' })); });
  expect(screen.getByRole('status').textContent).toBe('Saved');
});
it('regenerates a PDF when the user edits while the previous version is rendering', async () => {
  const { copyResume, emptyWorkspace } = await import('../../lib/types');
  const record = emptyRecord(), resume = copyResume(record, emptyWorkspace(), 'resume-1', 'Example');
  vi.stubGlobal('IntersectionObserver', class { observe() { return undefined; } disconnect() { return undefined; } });
  const createObjectURL = vi.fn().mockReturnValue('blob:download');
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() });
  const anchor = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => undefined);
  let finish: (response: Response) => void = () => { throw new Error('Render not started'); };
  const fetchPdf = vi.fn<typeof fetch>().mockImplementationOnce(() => new Promise((resolve) => { finish = resolve; })).mockResolvedValueOnce(new Response('fresh PDF', { headers: { 'X-Resume-Pages': '1' } }));
  vi.stubGlobal('fetch', fetchPdf);
  let revision = 1;
  const save = vi.fn<(form: FormData) => Promise<{ revision: string }>>().mockImplementation(async () => ({ revision: `revision-${++revision}` }));
  try {
    render(<RecordEditor record={record} resume={resume} revision="revision-1" saveAction={save} />);
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Download PDF$/ })); });
    expect(fetchPdf).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText('Headline · English'), { target: { value: 'Latest wording' } });
    await act(async () => { finish(new Response('old PDF', { headers: { 'X-Resume-Pages': '1' } })); });
    expect(fetchPdf).toHaveBeenCalledTimes(2); expect(save).toHaveBeenCalledTimes(1);
    expect(save.mock.calls[0][0].get('headline.en')).toBe('Latest wording');
    expect(fetchPdf.mock.calls[1][0]).toContain('revision=revision-2');
    const exported = await new Promise((resolve) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsText(createObjectURL.mock.calls[0][0]); });
    expect(exported).toBe('fresh PDF');
    expect(anchor).toHaveBeenCalledTimes(1);
  } finally { anchor.mockRestore(); vi.unstubAllGlobals(); }
});
