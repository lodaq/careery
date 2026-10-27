// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ResumeList } from './ResumeList';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock('./actions', () => ({ createResumeAction: vi.fn(), deleteResumeAction: vi.fn() }));
afterEach(cleanup);
it('combines organization and search filters without changing the source list', async () => {
  const resumes = [{ id: '1', name: 'Engineer', language: 'en', revision: 'a', profileName: 'Technology' }, { id: '2', name: 'Writer', language: 'ar', revision: 'b' }];
  render(<ResumeList resumes={resumes} dashboard />);
  fireEvent.click(await screen.findByRole('button', { name: /In profiles/ }));
  expect(screen.queryByRole('link', { name: 'Writer' })).toBeNull();
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: ' TECHNOLOGY ' } });
  expect(screen.getByRole('link', { name: 'Engineer' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: /Unfiled/ }));
  expect(screen.getByRole('status').textContent).toContain('No resumes match');
  fireEvent.change(screen.getByRole('searchbox'), { target: { value: '' } });
  expect(screen.getByRole('link', { name: 'Writer' })).toBeTruthy();
  expect(resumes).toHaveLength(2);
});
it('opens creation in a dialog and keeps the name when creation fails', async () => {
  const { createResumeAction } = await import('./actions');
  vi.mocked(createResumeAction).mockResolvedValueOnce({ error: 'Could not save. Retry.' });
  render(<ResumeList resumes={[]} profileId="profile-1" />);
  expect(screen.queryByRole('textbox', { name: 'New Resume name' })).toBeNull();
  fireEvent.click(await screen.findByRole('button', { name: 'Create Resume' }));
  const dialog = await screen.findByRole('dialog');
  const input = screen.getByRole('textbox', { name: 'New Resume name' });
  fireEvent.change(input, { target: { value: 'Product engineer' } });
  fireEvent.submit(dialog.querySelector('form')!);
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not save. Retry.');
  expect(input).toHaveValue('Product engineer');
  expect(createResumeAction).toHaveBeenCalledWith(expect.any(FormData));
  const data = vi.mocked(createResumeAction).mock.calls.at(-1)![0];
  expect(data.get('profileId')).toBe('profile-1');
});
