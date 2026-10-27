"use client"

// Adapted from Cult UI's Motion Reorder sortable-list for owned form content.
import { useId, useState, type ReactNode } from "react"
import { Reorder, useDragControls, useReducedMotion } from "motion/react"
import { GripVerticalIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type Identified = { id: string }
interface SortableListProps<T extends Identified> {
  items: T[]
  onReorder: (items: T[]) => void
  label: string
  itemLabel: (item: T, index: number) => string
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode
}

function SortableListItem<T extends Identified>({ item, label, instructionId, onMove, children }: {
  item: T; label: string; instructionId: string; onMove: (direction: number) => void;
  children: (handle: ReactNode) => ReactNode
}) {
  const controls = useDragControls()
  const reduce = useReducedMotion()
  return <Reorder.Item value={item} dragListener={false} dragControls={controls}
    className="sortable-item" initial={false} layout={reduce ? undefined : "position"}
    transition={reduce ? { duration: 0 } : { type: "spring", bounce: 0, duration: .2 }}>
    {children(<Button type="button" variant="ghost" size="icon" className="sort-handle"
      aria-label={`Reorder ${label}`} aria-describedby={instructionId}
      onPointerDown={(event) => { if (event.button === 0) controls.start(event); }}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault(); onMove(event.key === "ArrowUp" ? -1 : 1)
        }
      }}><GripVerticalIcon /></Button>)}
  </Reorder.Item>
}

function SortableList<T extends Identified>({ items, onReorder, label, itemLabel, renderItem }: SortableListProps<T>) {
  const instructionId = useId()
  const [announcement, setAnnouncement] = useState("")
  return <>
    <p id={instructionId} className="sr-only">Drag the handle to reorder. With the handle focused, use Arrow Up or Arrow Down.</p>
    <p className="sr-only" aria-live="polite">{announcement}</p>
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className="sortable-list" aria-label={label}>
      {items.map((item, index) => <SortableListItem key={item.id} item={item} label={itemLabel(item, index)} instructionId={instructionId} onMove={(direction) => {
        const target = index + direction
        if (target < 0 || target >= items.length) return
        const next = [...items]; [next[index], next[target]] = [next[target], next[index]]
        onReorder(next); setAnnouncement(`${itemLabel(item, index)} moved to position ${target + 1} of ${items.length}.`)
      }}>{(handle) => renderItem(item, index, handle)}</SortableListItem>)}
    </Reorder.Group>
  </>
}

export { SortableList }
export default SortableList
