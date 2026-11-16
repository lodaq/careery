// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { SidebarProvider, useSidebar } from './sidebar';

vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));
afterEach(() => { cleanup(); document.cookie = 'sidebar_state=; path=/; max-age=0'; });
function Control() {
  const { state, toggleSidebar } = useSidebar();
  return <button onClick={toggleSidebar}>{state}</button>;
}
it('keeps the sidebar collapsed when navigation remounts its provider', () => {
  const first = render(<SidebarProvider><Control /></SidebarProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'expanded' }));
  expect(screen.getByRole('button', { name: 'collapsed' })).toBeDefined();
  first.unmount();
  render(<SidebarProvider><Control /></SidebarProvider>);
  expect(screen.getByRole('button', { name: 'collapsed' })).toBeDefined();
  fireEvent.click(screen.getByRole('button', { name: 'collapsed' }));
  expect(screen.getByRole('button', { name: 'expanded' })).toBeDefined();
});
