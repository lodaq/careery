"use client"

// Dependency-free reordering for owned form content.
import { useId, useState, type ReactNode } from "react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

type Identified = { id: string }
interface SortableListProps<T extends Identified> {
  items: T[]
  onReorder: (items: T[]) => void
  label: string
  itemLabel: (item: T, index: number) => string
  renderItem: (item: T, index: number, handle: ReactNode) => ReactNode
}

function SortableListItem({ label, instructionId, first, last, onMove, children }: {
  label: string; instructionId: string; first: boolean; last: boolean; onMove: (direction: number) => void;
  children: (handle: ReactNode) => ReactNode
}) {
  return <li className="sortable-item">
    {children(<div className="sort-handle" role="group" aria-label={`Reorder ${label}`} aria-describedby={instructionId}
      onKeyDown={(event) => {
        if (event.key === "ArrowUp" || event.key === "ArrowDown") {
          event.preventDefault(); onMove(event.key === "ArrowUp" ? -1 : 1)
        }
      }}>
      <Button type="button" variant="ghost" size="icon" className="sort-move" aria-label={`Move ${label} up`} disabled={first} onClick={() => onMove(-1)}><ChevronUpIcon aria-hidden="true" /></Button>
      <Button type="button" variant="ghost" size="icon" className="sort-move" aria-label={`Move ${label} down`} disabled={last} onClick={() => onMove(1)}><ChevronDownIcon aria-hidden="true" /></Button>
    </div>)}
  </li>
}

function SortableList<T extends Identified>({ items, onReorder, label, itemLabel, renderItem }: SortableListProps<T>) {
  const instructionId = useId()
  const [announcement, setAnnouncement] = useState("")
  return <>
    <p id={instructionId} className="sr-only">Use the move buttons to reorder this list.</p>
    <p className="sr-only" aria-live="polite">{announcement}</p>
    <ul className="sortable-list" aria-label={label}>
      {items.map((item, index) => <SortableListItem key={item.id} label={itemLabel(item, index)} instructionId={instructionId}
        first={index === 0} last={index === items.length - 1} onMove={(direction) => {
          const target = index + direction
          if (target < 0 || target >= items.length) return
          const next = [...items]; [next[index], next[target]] = [next[target], next[index]]
          onReorder(next); setAnnouncement(`${itemLabel(item, index)} moved to position ${target + 1} of ${items.length}.`)
        }}>{(handle) => renderItem(item, index, handle)}</SortableListItem>)}
    </ul>
  </>
}

export { SortableList }
export default SortableList
