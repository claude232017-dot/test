"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, StickyNote } from "lucide-react"
import { useNotes } from "@/hooks/useNotes"
import { NoteCard } from "./note-card"
import { NoteEditor } from "./note-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function NotesWidget() {
  const { notes, loading, createNote, updateNote, deleteNote } = useNotes()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const selectedNote = notes.find(n => n.id === selectedId) ?? null

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  )

  async function handleCreate() {
    const note = await createNote()
    if (note) setSelectedId(note.id)
  }

  async function handleDelete(id: string) {
    await deleteNote(id)
    if (selectedId === id) setSelectedId(notes.find(n => n.id !== id)?.id ?? null)
  }

  return (
    <div className="flex gap-4 h-full min-h-[500px]">
      {/* Sidebar */}
      <div className="w-56 shrink-0 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search…"
              className="pl-8 h-8 text-xs"
            />
          </div>
          <Button size="icon" className="h-8 w-8 shrink-0" onClick={handleCreate}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1 pr-1">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 rounded-lg bg-white/5 animate-pulse" />
            ))
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <StickyNote className="w-8 h-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs text-muted-foreground">
                {search ? "No results" : "No notes yet"}
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filtered.map(note => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <NoteCard
                    note={note}
                    isSelected={note.id === selectedId}
                    onClick={() => setSelectedId(note.id)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-white/5 shrink-0" />

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        {selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onUpdate={updateNote}
            onDelete={handleDelete}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <StickyNote className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">Select a note or create a new one</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-1" /> New note
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
