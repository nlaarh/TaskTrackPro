import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Clean secondary button (Google/Apple style)
        default: "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200",
        
        // Clean minimal button (Google/Apple style)
        action: "bg-gray-900 text-white hover:bg-gray-800 border border-gray-900 hover:border-gray-800 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200",
        
        // Destructive remains red
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow-md",
        
        // Gmail-style outline
        outline: "border border-[hsl(0,0%,87%)] bg-background hover:bg-[hsl(0,0%,98%)] hover:text-[hsl(0,0%,13%)] shadow-sm hover:shadow-md",
        
        // Secondary neutral
        secondary: "bg-[hsl(0,0%,98%)] text-[hsl(0,0%,13%)] hover:bg-[hsl(0,0%,94%)] border border-[hsl(0,0%,91%)]",
        
        // Ghost for minimal actions
        ghost: "hover:bg-[hsl(0,0%,96%)] hover:text-[hsl(0,0%,13%)]",
        
        // Link style
        link: "text-[hsl(0,0%,25%)] underline-offset-4 hover:underline hover:text-[hsl(0,0%,13%)]",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
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
