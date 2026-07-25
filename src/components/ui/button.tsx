import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-b from-[#f8d264] to-[hsl(var(--primary))] text-primary-foreground font-extrabold hover:shadow-[0_0_18px_rgba(245,197,66,0.25)]",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "bg-secondary border border-[rgba(var(--overlay),0.14)] text-foreground hover:border-[rgba(245,197,66,0.45)] hover:text-gold",
        secondary: "bg-secondary text-foreground hover:bg-secondary/80",
        ghost: "hover:bg-[rgba(var(--overlay),0.05)] text-foreground",
        link: "text-gold underline-offset-4 hover:underline",
        cyan: "bg-[#0f9bbd] text-white hover:bg-[#0c85a2] shadow-lg shadow-black/25",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
