"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trash2, Check, Loader2 } from "lucide-react"
import { Note } from "@/types"
import { useDebounce } from "@/hooks/useNotes"
import { Button } from "@/components/ui/button"

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

  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
    setSaveState("idle")
  }, [note.id])

  useEffect(() => {
    if (debouncedTitle === note.title && debouncedContent === note.content) return
    setSaveState("saving")
    onUpdate(note.id, { title: debouncedTitle, content: debouncedContent }).then(ok => {
      setSaveState(ok ? "saved" : "idle")
      if (ok) setTimeout(() => setSaveState("idle"), 2000)
    })
  }, [debouncedTitle, debouncedContent])

  return (
    <div className="flex flex-col h-full gap-0 px-4">
      {/* Title row — inline with save indicator and delete */}
      <div className="flex items-center gap-2 mt-5 mb-4">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Untitled"
          className="flex-1 py-0 text-xl font-semibold text-foreground placeholder:text-muted-foreground/30 bg-transparent border-0 outline-none ring-0 focus:outline-none focus:ring-0 min-w-0"
        />
        <AnimatePresence mode="wait">
          {saveState !== "idle" && (
            <motion.span
              key={saveState}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-1 text-xs text-muted-foreground shrink-0"
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
          className="h-7 w-7 shrink-0 text-muted-foreground hover:text-red-400"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Content */}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="Start writing…"
        className="flex-1 bg-transparent resize-none text-sm leading-relaxed p-3 min-h-0 text-foreground placeholder:text-muted-foreground/30 rounded-xl border border-[rgba(var(--overlay),0.06)] focus:border-purple-500/40 transition-colors"
        style={{ outline: 'none', boxShadow: 'none' }}
      />
    </div>
  )
}
