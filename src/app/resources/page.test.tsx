// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import ResourcesPage from './page';

vi.mock('@/components/WorkspaceAccount', () => ({ WorkspaceAccount: () => null }));
vi.mock('next/navigation', () => ({ usePathname: () => '/resources' }));
vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })));
afterEach(cleanup);

it('makes the curated directory reachable and starts with the requested Mokabla link', () => {
  render(<ResourcesPage />);
  expect(screen.getByRole('heading', { level: 1, name: 'Resources' })).toBeDefined();
  expect(screen.getByText('Careery')).toBeDefined();
  expect(within(screen.getByRole('banner')).getByRole('heading', { level: 1, name: 'Resources' })).toBeDefined();
  expect(within(screen.getByRole('main')).queryByRole('heading', { level: 1 })).toBeNull();
  const navigation = screen.getByRole('navigation', { name: 'Workspace' });
  const resourcesLink = within(navigation).getByRole('link', { name: 'Resources' });
  expect(resourcesLink.getAttribute('href')).toBe('/resources');
  expect(resourcesLink.getAttribute('aria-current')).toBe('page');
  const links = within(screen.getByRole('main')).getAllByRole('link');
  expect(links[0].textContent).toBe('Mokabla');
  expect(links[0].getAttribute('href')).toBe('https://www.mokabla.com/ar/companies');
  expect(screen.getAllByRole('region')).toHaveLength(4);
  for (const link of links) {
    expect(new URL(link.getAttribute('href')!).protocol).toBe('https:');
    expect(link.getAttribute('rel')).toContain('noreferrer');
  }
});
