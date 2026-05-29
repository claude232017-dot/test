import { TodosWidget } from "@/components/widgets/todos/todos-widget"

export default function TodosPage() {
  return (
    <div className="flex flex-col h-full gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Todos</h1>
        <p className="text-sm text-muted-foreground mt-1">Track tasks with priority and due dates</p>
      </div>
      <div className="glass rounded-xl p-5 flex-1">
        <TodosWidget />
      </div>
    </div>
  )
}
