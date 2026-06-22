import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "sm" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-bold uppercase tracking-[0.1em] transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50 hover:-translate-y-[2px]",
          {
            "bg-primary-600 text-white hover:bg-primary-700 hover:shadow-brand-hover":
              variant === "primary",
            "border-2 border-primary-600 text-primary-600 bg-transparent hover:bg-primary-50 hover:shadow-brand-hover":
              variant === "secondary",
            "bg-transparent text-brand-body hover:bg-brand-light":
              variant === "ghost",
            "h-10 px-6 py-2 text-[14px]": size === "default",
            "h-8 rounded-md px-4 text-xs": size === "sm",
            "h-12 rounded-md px-8 text-[15px]": size === "lg",
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
