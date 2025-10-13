import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "app/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-primary-500 focus-visible:ring-primary-500/30 focus-visible:ring-[3px] aria-invalid:ring-error-500/20 aria-invalid:border-error-500",
  {
    variants: {
      variant: {
        default: "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm",
        destructive:
          "bg-error-500 text-white hover:bg-error-600 active:bg-error-700 shadow-sm focus-visible:ring-error-500/30",
        outline:
          "border-2 border-primary-600 bg-white text-primary-600 hover:bg-primary-50 active:bg-primary-100 shadow-sm",
        secondary:
          "bg-secondary-600 text-white hover:bg-secondary-700 active:bg-secondary-800 shadow-sm focus-visible:ring-secondary-500/30",
        ghost:
          "hover:bg-primary-50 hover:text-primary-700 active:bg-primary-100",
        link: "text-primary-600 underline-offset-4 hover:underline hover:text-primary-700",
      },
      size: {
        default: "h-10 px-4 py-2 has-[>svg]:px-3",
        sm: "h-9 rounded-md gap-1.5 px-3 text-xs has-[>svg]:px-2.5",
        lg: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
        icon: "size-10",
        "icon-sm": "size-9",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
