// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { afterEach, expect, it, vi } from 'vitest';
import { SortableList } from './sortable-list';

const drag = vi.hoisted(() => ({ end: vi.fn<(event: unknown) => void>() }));
vi.mock('@dnd-kit/react', () => ({
  DragDropProvider: ({ children, onDragEnd }: { children: ReactNode; onDragEnd: typeof drag.end }) => {
    drag.end.mockImplementation(onDragEnd);
    return children;
  },
  DragOverlay: () => null,
  PointerSensor: { configure: () => ({}) },
}));
vi.mock('@dnd-kit/react/sortable', () => ({
  useSortable: () => ({ ref: () => {}, handleRef: () => {} }),
  isSortable: (source: unknown) => Boolean(source),
}));
afterEach(cleanup);

it('commits the projected drop position even when the optimistic target is the source', () => {
  const reorder = vi.fn();
  const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
  render(<SortableList items={items} onReorder={reorder} label="Entries"
    itemLabel={(item) => item.id} renderItem={(item, _index, handle) => <>{handle}{item.id}</>} />);
  act(() => drag.end({ canceled: false, operation: {
    source: { id: 'a', initialIndex: 0, index: 2 }, target: { id: 'a' },
  } }));
  expect(reorder).toHaveBeenCalledWith([items[1], items[2], items[0]]);
  expect(screen.getByText('List reordered.')).toBeTruthy();
  reorder.mockClear();
  act(() => drag.end({ canceled: true, operation: {
    source: { id: 'a', initialIndex: 0, index: 2 },
  } }));
  expect(reorder).not.toHaveBeenCalled();
});
