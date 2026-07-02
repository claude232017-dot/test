"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface SortableItemProps {
  id: string
  children: React.ReactNode
  handleClassName?: string
  disabled?: boolean
}

/**
 * Wraps a list item and provides a drag handle. The handle is what the user
 * grabs; the wrapped children stay fully interactive (clicks, buttons, etc.).
 */
export function SortableItem({ id, children, handleClassName, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/sortable">
      {!disabled && (
        <button
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label="Drag to reorder"
          className={cn(
            "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-1 opacity-0 group-hover/sortable:opacity-100 md:group-hover/sortable:opacity-100 focus-visible:opacity-100 text-muted-foreground hover:text-foreground transition-opacity cursor-grab active:cursor-grabbing touch-none",
            handleClassName
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      )}
      {children}
    </div>
  )
}
