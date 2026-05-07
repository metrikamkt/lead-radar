import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  color?: string;
}

export function Progress({ className, value = 0, max = 100, color, ...props }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = color || (pct >= 70 ? "bg-red-500" : pct >= 40 ? "bg-orange-500" : "bg-blue-500");

  return (
    <div
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-slate-100", className)}
      {...props}
    >
      <div
        className={cn("h-full rounded-full transition-all duration-500", barColor)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
