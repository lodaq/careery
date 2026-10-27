// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { copyResume, emptyRecord, emptyWorkspace } from '../../lib/types';
import { ResumePreview, type PdfAsset } from './ResumePreview';
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

it('renders live saved content and updates the proof without generating PDFs', () => {
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Example');
  resume.basics.name = { en: 'Initial name' };
  resume.summary = { en: 'Initial summary' };
  const prepare = vi.fn(), download = vi.fn();
  const { rerender } = render(<ResumePreview resume={resume} preparePdf={prepare} download={download} />);
  const proof = screen.getByRole('region', { name: 'Preview and download' });
  expect(within(proof).getByText('Initial name')).toBeTruthy();
  expect(within(proof).getByText('Initial summary')).toBeTruthy();
  const changed = structuredClone(resume);
  changed.basics.name.en = 'Updated name'; changed.summary.en = 'Updated summary';
  rerender(<ResumePreview resume={changed} preparePdf={prepare} download={download} />);
  expect(within(proof).getByText('Updated name')).toBeTruthy();
  expect(within(proof).getByText('Updated summary')).toBeTruthy();
  expect(within(proof).queryByText('Initial name')).toBeNull();
  expect(within(proof).queryByText('Initial summary')).toBeNull();
  expect(prepare).not.toHaveBeenCalled(); expect(download).not.toHaveBeenCalled();
});

it('disables duplicate PDF requests while downloading and restores the action on completion', async () => {
  let finish!: (asset: PdfAsset) => void;
  const download = vi.fn(() => new Promise<PdfAsset>((resolve) => { finish = resolve; }));
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Example');
  render(<ResumePreview resume={resume} preparePdf={vi.fn()} download={download} />);
  fireEvent.click(screen.getByRole('button', { name: 'Download PDF' }));
  const busy = screen.getByRole('button', { name: 'Preparing PDF…' });
  expect(busy.hasAttribute('disabled')).toBe(true);
  fireEvent.click(busy); expect(download).toHaveBeenCalledTimes(1);
  await act(async () => { finish({ blob: new Blob(['pdf']), pages: 1 }); });
  expect(screen.getByRole('button', { name: 'Download PDF' }).hasAttribute('disabled')).toBe(false);
});

it('shows a PDF failure and clears it when the user retries successfully', async () => {
  const download = vi.fn().mockRejectedValueOnce(new Error('PDF generation failed. Retry.')).mockResolvedValueOnce({ blob: new Blob(['pdf']), pages: 1 });
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Example');
  render(<ResumePreview resume={resume} preparePdf={vi.fn()} download={download} />);
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Download PDF' })); });
  expect(screen.getByRole('alert').textContent).toBe('PDF generation failed. Retry.');
  await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Download PDF' })); });
  expect(screen.queryByRole('alert')).toBeNull(); expect(download).toHaveBeenCalledTimes(2);
});

it('does not create a leaked preview URL when a manual request finishes after navigation', async () => {
  const createObjectURL = vi.fn(); vi.stubGlobal('URL', { createObjectURL });
  let finish!: (asset: PdfAsset) => void;
  const download = vi.fn(() => new Promise<PdfAsset>((resolve) => { finish = resolve; }));
  const resume = copyResume(emptyRecord(), emptyWorkspace(), 'r', 'Example');
  const { unmount } = render(<ResumePreview resume={resume} preparePdf={download} download={download} />);
  fireEvent.click(screen.getByRole('button', { name: 'Download PDF' })); expect(download).toHaveBeenCalledTimes(1);
  unmount(); await act(async () => { finish({ blob: new Blob(['pdf']), pages: 1 }); });
  expect(createObjectURL).not.toHaveBeenCalled();
});
