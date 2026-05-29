"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Check, Loader2 } from "lucide-react"
import { Note } from "@/types"
import { useDebounce } from "@/hooks/useNotes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

interface NoteEditorProps {
  note: Note
  onUpdate: (id: string, fields: Partial<Pick<Note, "title" | "content">>) => Promise<boolean>
  onDelete: (id: string) => void
}

export function NoteEditor({ note, onUpdate, onDelete }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle")

  const debouncedTitle = useDebounce(title, 500)
  const debouncedContent = useDebounce(content, 500)

  // Sync when a different note is selected
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setSaveState("idle")
  }, [note.id])

  // Auto-save on debounced changes
  useEffect(() => {
    if (debouncedTitle === note.title && debouncedContent === note.content) return
    setSaveState("saving")
    onUpdate(note.id, { title: debouncedTitle, content: debouncedContent }).then(ok => {
      setSaveState(ok ? "saved" : "idle")
      if (ok) setTimeout(() => setSaveState("idle"), 2000)
    })
  }, [debouncedTitle, debouncedContent])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-3">
        <AnimatePresence mode="wait">
          {saveState !== "idle" && (
            <motion.span
              key={saveState}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-muted-foreground"
            >
              {saveState === "saving"
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving…</>
                : <><Check className="w-3 h-3 text-green-400" /> Saved</>
              }
            </motion.span>
          )}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-muted-foreground hover:text-red-400"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <Input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Note title…"
        className="mb-3 bg-transparent border-transparent focus-visible:border-purple-500/50 text-base font-medium px-0"
      />
      <Textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Start writing…"
        className="flex-1 bg-transparent border-transparent focus-visible:border-purple-500/50 resize-none text-sm leading-relaxed px-0"
      />
    </div>
  )
}
