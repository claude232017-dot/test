import { SignupForm } from "@/components/auth/signup-form"
import { AuthShell } from "@/components/auth/auth-shell"

export default function SignupPage() {
  return (
    <AuthShell title="Create your account" subtitle="Start tracking your day in under a minute.">
      <SignupForm />
    </AuthShell>
  )
}
