import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "bg-blue-600 text-white",
    secondary: "bg-slate-100 text-slate-700",
    destructive: "bg-red-100 text-red-700",
    outline: "border border-slate-200 text-slate-700 bg-white",
    success: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
