import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // text-base on mobile: fonts under 16px make iOS Safari auto-zoom on focus
          "flex h-11 w-full rounded-lg border border-[rgba(var(--overlay),0.1)] bg-[rgba(var(--overlay),0.05)] px-3.5 py-1 text-base sm:text-sm text-foreground shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-[rgba(var(--overlay),0.2)] focus:border-primary/50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
