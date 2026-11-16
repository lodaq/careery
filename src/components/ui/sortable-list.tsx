"use client"

import { DragDropProvider, DragOverlay, PointerSensor, KeyboardSensor } from "@dnd-kit/react"
import { PointerActivationConstraints } from "@dnd-kit/dom"
import { useSortable, isSortable } from "@dnd-kit/react/sortable"
import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react"
import { GripVerticalIcon } from "lucide-react"

const rowPointerSensor = PointerSensor.configure({
  activationConstraints: [new PointerActivationConstraints.Distance({ value: 5 })],
  preventActivation: (event, source) => {
    const target = event.target
    if (!(target instanceof Element) || target.closest(".sortable-item") !== source.element) return true
    const control = target.closest("input, textarea, select, a, button, [contenteditable=true]")
    return Boolean(control && !control.matches('[data-slot="collapsible-trigger"], .sortable-header'))
  },
})

type Identified = { id: string }
interface SortableListProps<T extends Identified> {
  items: T[]
  onReorder: (items: T[]) => void
  label: string
  itemLabel: (item: T, index: number) => string
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode
}

function SortableListItem({ id, index, label, instructionId, reducedMotion, disabled, onMove, children }: {
  disabled: boolean; reducedMotion: boolean; id: string; index: number; label: string; instructionId: string; onMove: (direction: number) => void;
  children: (handle: ReactNode) => ReactNode
}) {
  const { ref, handleRef } = useSortable({ id, index, disabled, transition: reducedMotion ? null : { duration: 150, easing: "ease-out" } })
  const itemRef = useCallback((element: HTMLLIElement | null) => {
    ref(element)
    handleRef(element?.querySelector('.sortable-header') ?? element)
  }, [ref, handleRef])
  return <li ref={itemRef} className="sortable-item" aria-label={`Reorder ${label}`} aria-describedby={instructionId}
    onKeyDown={(event) => {
      const target = event.target
      if (!(target instanceof Element) || target.closest(".sortable-item") !== event.currentTarget ||
        target.closest("input, textarea, select, [contenteditable=true]")) return
      if (event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault(); event.stopPropagation(); onMove(event.key === "ArrowUp" ? -1 : 1)
      }
    }}>
    {children(<GripVerticalIcon className="sort-grip" aria-hidden="true" />)}
  </li>
}

function SortableList<T extends Identified>({ items, onReorder, label, itemLabel, renderItem }: SortableListProps<T>) {
  const [reducedMotion, setReducedMotion] = useState(true)
  useEffect(() => {
    if (!window.matchMedia) return
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReducedMotion(media.matches)
    update(); media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  const listRef = useRef<HTMLUListElement>(null)
  const [disabled, setDisabled] = useState(false)
  useEffect(() => {
    if (!listRef.current || !window.ResizeObserver) return
    const observer = new ResizeObserver(([entry]) => setDisabled(entry.contentRect.width === 0 || entry.contentRect.height === 0))
    observer.observe(listRef.current)
    return () => observer.disconnect()
  }, [])
  const instructionId = useId()
  const [announcement, setAnnouncement] = useState("")
  return <DragDropProvider sensors={(defaults) => [...defaults.filter((sensor) => sensor !== PointerSensor && sensor !== KeyboardSensor), rowPointerSensor]} onDragEnd={(event) => {
    const { source } = event.operation
    if (event.canceled || !isSortable(source) || source.initialIndex === source.index) return
    const next = [...items]
    const [item] = next.splice(source.initialIndex, 1)
    next.splice(source.index, 0, item)
    onReorder(next); setAnnouncement("List reordered.")
  }}>
    <DragOverlay dropAnimation={reducedMotion ? null : { duration: 150, easing: "ease-out" }} className="sortable-overlay">
      {(source) => <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-md">
        <GripVerticalIcon aria-hidden="true" className="size-4 shrink-0" />
        <span>{source.element?.querySelector('[data-slot="collapsible-trigger"] span')?.textContent || source.element?.textContent?.trim() || "Moving item"}</span>
      </div>}
    </DragOverlay>
    <p id={instructionId} className="sr-only">Drag the item header or focus the item and use Arrow Up and Arrow Down to reorder this list.</p>
    <p className="sr-only" aria-live="polite">{announcement}</p>
    <ul ref={listRef} className="sortable-list" aria-label={label}>
      {items.map((item, index) => <SortableListItem key={item.id} id={item.id} index={index} reducedMotion={reducedMotion} disabled={disabled} label={itemLabel(item, index)} instructionId={instructionId}
        onMove={(direction) => {
          const target = index + direction
          if (target < 0 || target >= items.length) return
          const next = [...items]; [next[index], next[target]] = [next[target], next[index]]
          onReorder(next); setAnnouncement(`${itemLabel(item, index)} moved to position ${target + 1} of ${items.length}.`)
        }}>{(handle) => renderItem(item, index, handle)}</SortableListItem>)}
    </ul>
  </DragDropProvider>
}

export { SortableList }
export default SortableList
