import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          // text-base on mobile: fonts under 16px make iOS Safari auto-zoom on focus
          "flex min-h-[80px] w-full rounded-lg border border-[rgba(var(--overlay),0.1)] bg-[rgba(var(--overlay),0.05)] px-3.5 py-2.5 text-base sm:text-sm text-foreground shadow-sm placeholder:text-muted-foreground hover:border-[rgba(var(--overlay),0.2)] focus:border-primary/50 disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
