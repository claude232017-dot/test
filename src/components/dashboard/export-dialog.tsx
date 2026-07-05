"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Download, FileJson, FileSpreadsheet, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { toast } from "sonner"
import {
  EXPORT_TABLES, type ExportTableKey,
  fetchAllData, fetchTable, toCSV, downloadFile,
} from "@/lib/export-data"
import { cn } from "@/lib/utils"

interface ExportDialogProps {
  open: boolean
  onClose: () => void
}

export function ExportDialog({ open, onClose }: ExportDialogProps) {
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  const stamp = format(new Date(), "yyyy-MM-dd")

  async function exportJSON() {
    setBusy("json")
    try {
      const data = await fetchAllData()
      downloadFile(
        `dayflow-export-${stamp}.json`,
        JSON.stringify({ exported_at: new Date().toISOString(), ...data }, null, 2),
        "application/json"
      )
      toast.success("Export downloaded")
    } catch {
      toast.error("Export failed — please try again")
    } finally {
      setBusy(null)
    }
  }

  async function exportCSV(key: ExportTableKey, label: string) {
    setBusy(key)
    try {
      const rows = await fetchTable(key)
      if (rows.length === 0) {
        toast(`No ${label.toLowerCase()} to export`)
        return
      }
      downloadFile(`dayflow-${key}-${stamp}.csv`, toCSV(rows), "text/csv")
      toast.success(`${label} CSV downloaded`)
    } catch {
      toast.error("Export failed — please try again")
    } finally {
      setBusy(null)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Export data"
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-md max-h-full overflow-y-auto glass-strong rounded-2xl border border-[rgba(var(--overlay),0.1)] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-purple-400" />
                <h2 className="text-base font-semibold text-foreground">Export your data</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-[rgba(var(--overlay),0.05)] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-4">
              {/* Full JSON export */}
              <button
                onClick={exportJSON}
                disabled={busy !== null}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-purple-500/25 bg-purple-500/10 hover:bg-purple-500/15 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                {busy === "json"
                  ? <Loader2 className="w-5 h-5 text-purple-400 animate-spin shrink-0" />
                  : <FileJson className="w-5 h-5 text-purple-400 shrink-0" />}
                <div>
                  <p className="text-sm font-medium text-foreground">Everything as JSON</p>
                  <p className="text-[11px] text-muted-foreground">All tables in one file — best for backups</p>
                </div>
              </button>

              {/* Per-table CSV */}
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mb-2">
                  Individual tables (CSV)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {EXPORT_TABLES.map(t => (
                    <button
                      key={t.key}
                      onClick={() => exportCSV(t.key, t.label)}
                      disabled={busy !== null}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2.5 rounded-lg border border-[rgba(var(--overlay),0.08)] bg-[rgba(var(--overlay),0.03)]",
                        "hover:bg-[rgba(var(--overlay),0.06)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed text-left"
                      )}
                    >
                      {busy === t.key
                        ? <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin shrink-0" />
                        : <FileSpreadsheet className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
                      <span className="text-xs text-foreground truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground/60 leading-relaxed">
                Exports contain only your own data. Files download directly to your device — nothing is sent anywhere else.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
