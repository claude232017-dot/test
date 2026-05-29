"use client"

import { useEffect, useState } from "react"
import { createClient, getCurrentUserId } from "@/lib/supabase/client"
import { useDataStore } from "@/stores/useDataStore"
import { Note } from "@/types"
import { toast } from "sonner"

export function useNotes() {
  const supabase = createClient()
  const notes = useDataStore(s => s.notes)
  const hydrated = useDataStore(s => s.notesHydrated)
  const setNotes = useDataStore(s => s.setNotes)
  const loadNotes = useDataStore(s => s.loadNotes)

  // Show a skeleton only on the very first load; afterwards cached data is
  // rendered instantly and refreshed in the background.
  const [loading, setLoading] = useState(!hydrated)

  useEffect(() => {
    loadNotes().finally(() => setLoading(false))
  }, [])

  async function createNote() {
    const userId = await getCurrentUserId()
    if (!userId) { toast.error("You must be signed in to create a note"); return null }
    const { data, error } = await supabase
      .from("notes")
      .insert({ title: "", content: "", user_id: userId })
      .select()
      .single()
    if (error) { toast.error("Failed to create note"); return null }
    setNotes(prev => [data, ...prev])
    return data as Note
  }

  async function updateNote(id: string, fields: Partial<Pick<Note, "title" | "content">>) {
    const { error } = await supabase.from("notes").update(fields).eq("id", id)
    if (error) { toast.error("Failed to save note"); return false }
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...fields, updated_at: new Date().toISOString() } : n))
    return true
  }

  async function deleteNote(id: string) {
    setNotes(prev => prev.filter(n => n.id !== id))
    const { error } = await supabase.from("notes").delete().eq("id", id)
    if (error) { toast.error("Failed to delete note"); loadNotes() }
  }

  return { notes, loading, createNote, updateNote, deleteNote }
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}
