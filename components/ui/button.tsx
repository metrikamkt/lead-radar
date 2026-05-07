import * as React from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm",
      outline: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
      ghost: "text-slate-700 hover:bg-slate-100",
      destructive: "bg-red-600 text-white hover:bg-red-700",
      secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
      link: "text-blue-600 underline-offset-4 hover:underline p-0 h-auto",
    };

    const sizes = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-7 px-3 text-xs",
      lg: "h-11 px-6 text-base",
      icon: "h-9 w-9",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
