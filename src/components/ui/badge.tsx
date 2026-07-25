import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  // PRISM-X status chip: mono, uppercase, 5px radius, 1px tinted border + ~8% fill
  "inline-flex items-center chip-radius border px-2 py-0.5 text-[10px] deck-label transition-colors",
  {
    variants: {
      variant: {
        default: "border-primary/30 bg-primary/10 text-accent-strong",
        secondary: "border-[rgba(var(--overlay),0.14)] bg-secondary text-secondary-foreground",
        destructive: "border-red-500/30 bg-red-500/10 text-red-400",
        outline: "border-[rgba(var(--overlay),0.2)] text-foreground",
        high: "border-red-500/30 bg-red-500/10 text-red-400",
        medium: "border-primary/30 bg-primary/10 text-accent-strong",
        low: "border-green-500/30 bg-green-500/10 text-green-400",
        cyan: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
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
