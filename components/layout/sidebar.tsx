"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Users,
  BarChart2,
  Download,
  Settings,
  Zap,
  Target,
  Bell,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/searches", label: "Buscas", icon: Search },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/niches", label: "Nichos", icon: BarChart2 },
  { href: "/exports", label: "Exportar", icon: Download },
  { href: "/settings", label: "Configurações", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-slate-900 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-700/50">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
          <Target className="h-4.5 w-4.5 text-white" size={18} />
        </div>
        <div>
          <div className="text-white font-bold text-base leading-none">Lead Radar</div>
          <div className="text-slate-400 text-xs mt-0.5">Prospecção Inteligente</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-blue-600 text-white"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Auto-search indicator */}
      <div className="px-3 pb-3">
        <div className="flex items-center gap-2.5 rounded-lg bg-slate-800 px-3 py-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-slate-300">Busca automática</div>
            <div className="text-xs text-slate-500 truncate">3 campanhas ativas</div>
          </div>
          <Zap size={13} className="text-yellow-400 shrink-0" />
        </div>
      </div>

      {/* User */}
      <div className="border-t border-slate-700/50 px-3 py-3">
        <button className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 hover:bg-slate-800 transition-colors">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold shrink-0">
            M
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-xs font-medium text-slate-300 truncate">Metrika Marketing</div>
            <div className="text-xs text-slate-500 truncate">admin@metrika.com.br</div>
          </div>
          <ChevronDown size={13} className="text-slate-500 shrink-0" />
        </button>
      </div>
    </aside>
  );
}
