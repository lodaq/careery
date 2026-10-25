// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { EntryPicker } from './EntryPicker';
import type { CareerEntry } from '../../lib/types';
afterEach(cleanup);
it('filters English and Arabic by type without changing selection or triggering autosave', () => {
  const entries: CareerEntry[] = [{ id: 'skill', kind: 'skills', name: { en: 'TypeScript', ar: 'تايب سكريبت' } }, { id: 'project', kind: 'projects', name: { en: 'Documentation' }, description: { en: 'Useful project' }, bullets: [] }];
  const onToggle = vi.fn(), changed = vi.fn();
  render(<form onChange={changed}><EntryPicker entries={entries} selectedIds={['skill']} open onToggle={onToggle} /></form>);
  fireEvent.change(screen.getByLabelText('Search Career Record'), { target: { value: 'تايب' } });
  expect(screen.getAllByRole('checkbox')).toHaveLength(1);
  expect(screen.getByRole<HTMLInputElement>('checkbox').checked).toBe(true);
  expect(changed).not.toHaveBeenCalled(); expect(onToggle).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Entry type'), { target: { value: 'projects' } });
  expect(screen.getByText(/No matching entries/)).toBeTruthy(); expect(onToggle).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getAllByRole('checkbox')).toHaveLength(2);
  expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'TypeScript (skills)' }).checked).toBe(true);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Documentation (projects)' }));
  expect(onToggle).toHaveBeenCalledWith(entries[1], true); expect(changed).toHaveBeenCalledTimes(1);
});
