"use client"

import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { Note } from "@/types"

interface NoteCardProps {
  note: Note
  isSelected: boolean
  onClick: () => void
}

export function NoteCard({ note, isSelected, onClick }: NoteCardProps) {
  return (
    <motion.button
      layout
      onClick={onClick}
      className={cn(
        "w-full text-left px-3 py-2.5 rounded-xl border transition-all duration-150 cursor-pointer",
        isSelected
          ? "border-primary/40 bg-primary/10 shadow-[inset_2px_0_0_rgba(139,92,246,0.6)]"
          : "border-[rgba(var(--overlay),0.05)] bg-[rgba(var(--overlay),0.02)] hover:bg-[rgba(var(--overlay),0.05)] hover:border-[rgba(var(--overlay),0.1)]"
      )}
    >
      <p className="text-sm font-medium text-foreground truncate leading-snug">
        {note.title || "Untitled"}
      </p>
      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
        {note.content || "No content"}
      </p>
      <p className="text-[10px] text-muted-foreground/50 mt-1.5">
        {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
      </p>
    </motion.button>
  )
}
