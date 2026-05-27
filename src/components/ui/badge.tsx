import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#7c3aed]/20 text-purple-300",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-red-500/20 text-red-300",
        outline: "border-white/20 text-foreground",
        high: "border-transparent bg-red-500/20 text-red-300",
        medium: "border-transparent bg-yellow-500/20 text-yellow-300",
        low: "border-transparent bg-green-500/20 text-green-300",
        cyan: "border-transparent bg-cyan-500/20 text-cyan-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
