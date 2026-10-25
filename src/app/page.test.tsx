// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ProfileGrid } from './profiles/ProfileGrid';
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
afterEach(cleanup);
it('shows an empty Profile workspace without suggesting data already exists', () => {
  render(<ProfileGrid profiles={[]} unfiledCount={0} />);
  expect(screen.getByRole('heading', { name: 'No profiles yet' })).toBeDefined();
  expect(screen.getByRole('link', { name: 'Unfiled (0)' }).getAttribute('href')).toBe('/unfiled');
});
it('renders Profile entry and Resume counts with an editing destination', () => {
  render(<ProfileGrid profiles={[{ id: 'profile-1', name: 'Web developer', entryCount: 2, resumeCount: 3, revision: 'first' }]} unfiledCount={1} />);
  expect(screen.getByText('2 entries · 3 Resumes')).toBeDefined();
  expect(screen.getByRole('link', { name: 'Web developer' }).getAttribute('href')).toBe('/profiles/profile-1');
});
