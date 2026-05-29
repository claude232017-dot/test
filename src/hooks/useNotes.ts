"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Note } from "@/types"
import { toast } from "sonner"

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchNotes()

    const channel = supabase
      .channel("notes")
      .on("postgres_changes", { event: "*", schema: "public", table: "notes" }, fetchNotes)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  async function fetchNotes() {
    const { data, error } = await supabase
      .from("notes")
      .select("id,user_id,title,content,created_at,updated_at")
      .order("updated_at", { ascending: false })
    if (!error && data) setNotes(data)
    setLoading(false)
  }

  async function createNote() {
    const { data, error } = await supabase
      .from("notes")
      .insert({ title: "", content: "" })
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
    if (error) { toast.error("Failed to delete note"); await fetchNotes() }
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
