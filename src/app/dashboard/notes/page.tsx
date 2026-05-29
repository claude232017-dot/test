import { NotesWidget } from "@/components/widgets/notes/notes-widget"

export default function NotesPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Notes</h1>
        <p className="text-sm text-muted-foreground mt-1">Your personal notes — auto-saved as you type</p>
      </div>
      <div className="glass rounded-xl p-5 flex-1">
        <NotesWidget />
      </div>
    </div>
  )
}
