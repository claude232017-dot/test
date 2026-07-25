import { CheckSquare } from "lucide-react"
import { TodosWidget } from "@/components/widgets/todos/todos-widget"

export default function TodosPage() {
  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-cyan-500/10 flex items-center justify-center shrink-0">
          <CheckSquare className="w-[18px] h-[18px] text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Todos</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Track tasks with priority and due dates</p>
        </div>
      </div>
      <div className="glass-strong rounded-2xl p-5 flex-1 min-h-0">
        <TodosWidget />
      </div>
    </div>
  )
}
