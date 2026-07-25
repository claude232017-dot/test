import { StickyNote } from "lucide-react"
import { NotesWidget } from "@/components/widgets/notes/notes-widget"

export default function NotesPage() {
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <StickyNote className="w-[18px] h-[18px] text-gold" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Notes</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Your personal notes — auto-saved as you type</p>
        </div>
      </div>
      <div className="glass-strong rounded-2xl p-5 flex-1 min-h-0">
        <NotesWidget />
      </div>
    </div>
  )
}
