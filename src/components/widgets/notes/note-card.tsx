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
        "w-full text-left p-3 rounded-lg border transition-all duration-150 cursor-pointer",
        isSelected
          ? "border-purple-500/40 bg-purple-500/10"
          : "border-white/5 bg-white/[0.02] hover:bg-white/5 hover:border-white/10"
      )}
    >
      <p className="text-sm font-medium text-foreground truncate">
        {note.title || "Untitled"}
      </p>
      <p className="text-xs text-muted-foreground truncate mt-0.5">
        {note.content || "No content"}
      </p>
      <p className="text-[10px] text-muted-foreground/60 mt-1.5">
        {formatDistanceToNow(new Date(note.updated_at), { addSuffix: true })}
      </p>
    </motion.button>
  )
}
