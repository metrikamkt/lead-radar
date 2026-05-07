"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { getTemperatureColor, getTemperatureLabel, getScoreColor, getStatusLabel, getStatusColor } from "@/lib/scoring";
import { timeAgo } from "@/lib/utils";
import { Lead } from "@/lib/types";
import { Search, MapPin, Globe, AtSign, Mail, Phone, ArrowRight, Flame, Thermometer, Snowflake } from "lucide-react";

const tabs = [
  { key: "", label: "Todos", icon: null },
  { key: "hot", label: "Quentes", icon: Flame },
  { key: "warm", label: "Mornos", icon: Thermometer },
  { key: "cold", label: "Frios", icon: Snowflake },
];

export function LeadsContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("");
  const [filterNiche, setFilterNiche] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [sortBy, setSortBy] = useState("score");

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (tab) params.set("temperature", tab);
      if (filterNiche) params.set("niche", filterNiche);
      if (filterStatus) params.set("status", filterStatus);
      if (search) params.set("search", search);
      const res = await fetch(`/api/leads?${params}`);
      if (res.ok) setLeads(await res.json());
    } finally {
      setLoading(false);
    }
  }, [tab, filterNiche, filterStatus, search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const sorted = [...leads].sort((a, b) => {
    if (sortBy === "score") return b.score - a.score;
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "recent") {
      const da = a.createdAt ?? a.created_at ?? "";
      const db = b.createdAt ?? b.created_at ?? "";
      return new Date(db).getTime() - new Date(da).getTime();
    }
    return 0;
  });

  const niches = [...new Set(leads.map((l) => l.niche).filter(Boolean))];
  const counts = { all: leads.length, hot: leads.filter((l) => l.temperature === "hot").length, warm: leads.filter((l) => l.temperature === "warm").length, cold: leads.filter((l) => l.temperature === "cold").length };

  return (
    <div className="p-6 space-y-4">
      {/* Tabs */}
      <div className="flex items-center gap-1">
        {tabs.map(({ key, label, icon: Icon }) => {
          const count = key === "" ? counts.all : key === "hot" ? counts.hot : key === "warm" ? counts.warm : counts.cold;
          return (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${tab === key ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"}`}>
              {Icon && <Icon size={13} className={key === "hot" ? "text-red-400" : key === "warm" ? "text-orange-400" : "text-blue-400"} />}
              {label}
              <span className={`text-xs ${tab === key ? "text-slate-300" : "text-slate-400"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input className="pl-8" placeholder="Buscar lead..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-36" value={filterNiche} onChange={(e) => setFilterNiche(e.target.value)}>
          <option value="">Todos os nichos</option>
          {niches.map((n) => <option key={n} value={n!}>{n}</option>)}
        </Select>
        <Select className="w-32" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Qualquer status</option>
          <option value="new">Novo</option>
          <option value="contacted">Contatado</option>
          <option value="qualified">Qualificado</option>
          <option value="proposal">Proposta</option>
        </Select>
        <Select className="w-32" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="score">↓ Score</option>
          <option value="recent">↓ Recente</option>
          <option value="name">A-Z Nome</option>
        </Select>
        <span className="text-xs text-slate-400 ml-auto">{sorted.length} leads</span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-7 w-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sorted.length === 0 ? (
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
              <Search size={20} className="text-slate-400" />
            </div>
            <div>
              <div className="text-sm font-medium text-slate-700">Nenhum lead encontrado</div>
              <div className="text-xs text-slate-400 mt-1">
                {leads.length === 0 ? "Execute uma busca para começar a prospectar." : "Tente ajustar os filtros."}
              </div>
            </div>
            {leads.length === 0 && (
              <Link href="/searches/new"><Button size="sm">Criar primeira busca</Button></Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {sorted.map((lead) => (
            <Link key={lead.id} href={`/leads/${lead.id}`}>
              <Card className="hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer group">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center w-14 shrink-0">
                      <div className={`text-2xl font-bold ${getScoreColor(lead.score)}`}>{lead.score}</div>
                      <Progress value={lead.score} className="w-12 mt-1" />
                      <div className="text-[10px] text-slate-400 mt-0.5">score</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <span className="font-semibold text-slate-900">{lead.name}</span>
                        <Badge variant="outline" className="text-[10px]">{lead.niche}</Badge>
                        {lead.subniche && <Badge variant="secondary" className="text-[10px]">{lead.subniche}</Badge>}
                        <span className={`inline-flex items-center rounded-full px-2 py-0 text-[10px] font-medium border ${getTemperatureColor(lead.temperature)}`}>
                          {getTemperatureLabel(lead.temperature)}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-2">
                        <span className="flex items-center gap-1"><MapPin size={10} />{lead.city}, {lead.state}</span>
                        {lead.website && <span className="flex items-center gap-1 text-blue-500"><Globe size={10} />Site</span>}
                        {lead.instagram && <span className="flex items-center gap-1 text-pink-500"><AtSign size={10} />{lead.instagram}</span>}
                        {lead.email && <span className="flex items-center gap-1"><Mail size={10} />{lead.email}</span>}
                        {lead.phone && <span className="flex items-center gap-1"><Phone size={10} />{lead.phone}</span>}
                      </div>
                      {lead.opportunity && <p className="text-xs text-slate-500 line-clamp-1">{lead.opportunity}</p>}
                      {lead.termsFound && lead.termsFound.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {lead.termsFound.slice(0, 4).map((t) => (
                            <span key={t} className="inline-flex items-center rounded-full bg-green-50 border border-green-100 px-1.5 py-0 text-[10px] text-green-700">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${getStatusColor(lead.status)}`}>
                        {getStatusLabel(lead.status)}
                      </span>
                      <div className="text-xs text-slate-400">{lead.source}</div>
                      <div className="text-[10px] text-slate-300">{timeAgo(lead.createdAt ?? lead.created_at ?? "")}</div>
                      <ArrowRight size={13} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
