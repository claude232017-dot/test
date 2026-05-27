import { SignupForm } from "@/components/auth/signup-form"
import { LayoutDashboard } from "lucide-react"

export default function SignupPage() {
  return (
    <main className="min-h-dvh flex items-center justify-center p-4">
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        <div className="glass rounded-2xl p-8 glow-blue">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">DayFlow</h1>
              <p className="text-xs text-muted-foreground">Create your account</p>
            </div>
          </div>
          <SignupForm />
        </div>
      </div>
    </main>
  )
}
