// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { copyResume, emptyRecord, emptyWorkspace } from '../../lib/types';
import { ResumePreview } from './ResumePreview';
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it('waits until visible, replaces exact PDF pages after edits, and releases obsolete blob URLs', async () => {
  vi.useFakeTimers();
  let visible: (entries: { isIntersecting: boolean }[]) => void = () => { throw new Error('Observer not ready'); };
  const disconnect = vi.fn();
  vi.stubGlobal('IntersectionObserver', class { constructor(callback: typeof visible) { visible = callback; } observe() { return undefined; } disconnect = disconnect; });
  const createObjectURL = vi.fn().mockReturnValueOnce('blob:first').mockReturnValueOnce('blob:second'), revokeObjectURL = vi.fn();
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Example');
  const prepare = vi.fn().mockResolvedValueOnce({ blob: new Blob(['pdf']), pages: 2 }).mockResolvedValueOnce({ blob: new Blob(['new pdf']), pages: 1 });
  const { rerender, unmount } = render(<ResumePreview resume={resume} preparePdf={prepare} download={prepare} />);
  await act(async () => { await vi.advanceTimersByTimeAsync(1200); }); expect(prepare).not.toHaveBeenCalled();
  await act(async () => { visible([{ isIntersecting: true }]); });
  await act(async () => { await vi.advanceTimersByTimeAsync(1200); });
  expect(screen.getByTitle('Paginated Resume PDF').getAttribute('src')).toContain('blob:first');
  expect(screen.getByText('2 pages · over one page')).toBeTruthy();
  const changed = { ...resume, name: 'Changed' }; rerender(<ResumePreview resume={changed} preparePdf={prepare} download={prepare} />);
  expect(screen.getByText('Updating PDF preview…')).toBeTruthy();
  await act(async () => { await vi.advanceTimersByTimeAsync(1200); });
  expect(screen.getByText('1 page')).toBeTruthy(); expect(revokeObjectURL).toHaveBeenCalledWith('blob:first');
  unmount(); expect(revokeObjectURL).toHaveBeenCalledWith('blob:second'); expect(disconnect).toHaveBeenCalled();
});

it('does not create a leaked preview URL when a manual request finishes after navigation', async () => {
  vi.stubGlobal('IntersectionObserver', class { observe() { return undefined; } disconnect() { return undefined; } });
  const createObjectURL = vi.fn(), revokeObjectURL = vi.fn(); vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
  let finish: (asset: { blob: Blob; pages: number }) => void = () => { throw new Error('Request not started'); };
  const download = vi.fn(() => new Promise<{ blob: Blob; pages: number }>((resolve) => { finish = resolve; }));
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Example');
  const { unmount } = render(<ResumePreview resume={resume} preparePdf={download} download={download} />);
  fireEvent.click(screen.getByRole('button', { name: 'Download PDF' })); expect(download).toHaveBeenCalledTimes(1);
  unmount(); await act(async () => { finish({ blob: new Blob(['pdf']), pages: 1 }); });
  expect(createObjectURL).not.toHaveBeenCalled();
});
