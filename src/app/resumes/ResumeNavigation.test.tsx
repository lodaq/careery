// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { ResumeNavigation } from './ResumeNavigation';
afterEach(cleanup);
it('exposes the selected section and navigates without submitting the form', () => {
  const select = vi.fn();
  render(<ResumeNavigation active="basics" entries={[]} onSelect={select} chooseContent />);
  expect(screen.getByRole('button', { name: 'Personal info' }).getAttribute('aria-current')).toBe('page');
  const experience = screen.getByRole('button', { name: /Experience/ });
  expect(experience.getAttribute('type')).toBe('button');
  fireEvent.click(experience);
  expect(select).toHaveBeenCalledWith('experience');
  expect(screen.queryByText('AI Review')).toBeNull();
});
