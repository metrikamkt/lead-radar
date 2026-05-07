"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopbarProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm px-6">
      <div>
        <h1 className="text-base font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2">
        {actions}
        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-red-500" />
        </button>
      </div>
    </header>
  );
}
