import { LoginForm } from "@/components/auth/login-form"
import { AuthShell } from "@/components/auth/auth-shell"

// Rendered per-request: the form needs runtime Supabase config, so this page
// must not be prerendered at build time.
export const dynamic = "force-dynamic"

export default function LoginPage() {
  return (
    <AuthShell title="Welcome back" subtitle="Sign in to pick up where you left off.">
      <LoginForm />
    </AuthShell>
  )
}
