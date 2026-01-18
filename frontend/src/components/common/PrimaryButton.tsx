import * as React from "react"
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface PrimaryButtonProps extends ButtonProps {}

export const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 font-semibold shadow-lg cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
PrimaryButton.displayName = "PrimaryButton"
