import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon
  size?: "sm" | "md" | "lg"
  variant?: "default" | "outline" | "ghost"
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon: Icon, size = "md", variant = "ghost", className, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 w-8",
      md: "h-10 w-10",
      lg: "h-12 w-12",
    }

    return (
      <Button
        ref={ref}
        variant={variant}
        size="icon"
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        <Icon className="h-5 w-5" />
      </Button>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton }
