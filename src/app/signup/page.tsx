import { SignupForm } from "@/components/auth/signup-form"
import { AuthShell } from "@/components/auth/auth-shell"

// Rendered per-request: the form needs runtime Supabase config, so this page
// must not be prerendered at build time.
export const dynamic = "force-dynamic"

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="Start tracking your day in under a minute.">
      <SignupForm />
    </AuthShell>
  )
}
