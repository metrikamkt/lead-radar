"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { getTemperatureColor, getTemperatureLabel, getScoreColor, getStatusLabel, getStatusColor } from "@/lib/scoring";
import { timeAgo } from "@/lib/utils";
import {
  Users, Flame, Thermometer, Snowflake, TrendingUp, Star,
  Clock, ArrowRight, RefreshCw, MapPin, Globe, AtSign, Mail,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell,
} from "recharts";
import { Lead, DashboardStats } from "@/lib/types";

const NICHE_COLORS: Record<string, string> = {
  "Infoprodutores": "#3b82f6",
  "Clínicas de Estética": "#8b5cf6",
  "Advogados": "#10b981",
  "Academias": "#f59e0b",
  "Restaurantes": "#ef4444",
  "Consultórios": "#06b6d4",
  "Imobiliárias": "#f97316",
};

const weeklyData = [
  { day: "Seg", leads: 4, hot: 2 },
  { day: "Ter", leads: 7, hot: 3 },
  { day: "Qua", leads: 5, hot: 2 },
  { day: "Qui", leads: 12, hot: 6 },
  { day: "Sex", leads: 8, hot: 4 },
  { day: "Sáb", leads: 3, hot: 1 },
  { day: "Dom", leads: 8, hot: 5 },
];

export function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [filterNiche, setFilterNiche] = useState("");
  const [filterTemp, setFilterTemp] = useState("");
  const [filterScore, setFilterScore] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadData() {
    setRefreshing(true);
    try {
      const [statsRes, leadsRes, campaignsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/leads?limit=10"),
        fetch("/api/campaigns"),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (leadsRes.ok) setLeads(await leadsRes.json());
      if (campaignsRes.ok) setCampaigns(await campaignsRes.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const filtered = leads.filter((l) => {
    if (filterNiche && l.niche !== filterNiche) return false;
    if (filterTemp && l.temperature !== filterTemp) return false;
    if (filterScore && l.score < parseInt(filterScore)) return false;
    return true;
  });

  const niches = [...new Set(leads.map((l) => l.niche).filter(Boolean))];

  const nicheData = Object.entries(
    leads.reduce((acc, l) => {
      if (l.niche) acc[l.niche] = (acc[l.niche] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, leads: count, color: NICHE_COLORS[name] ?? "#94a3b8" }));

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500">Carregando dados...</p>
        </div>
      </div>
    );
  }

  const isEmpty = !stats || stats.totalLeads === 0;

  return (
    <div className="p-6 space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users size={18} className="text-blue-600" />} bg="bg-blue-50"
          label="Total de Leads" value={stats?.totalLeads ?? 0}
          sub={stats?.newLeadsToday ? `+${stats.newLeadsToday} hoje` : "Nenhum ainda"}
          subColor={stats?.newLeadsToday ? "text-green-600" : "text-slate-400"} />
        <StatCard icon={<Flame size={18} className="text-red-500" />} bg="bg-red-50"
          label="Leads Quentes" value={stats?.hotLeads ?? 0}
          sub={stats?.totalLeads ? `${Math.round(((stats?.hotLeads ?? 0) / stats.totalLeads) * 100)}% do total` : "—"}
          subColor="text-red-500" />
        <StatCard icon={<Thermometer size={18} className="text-orange-500" />} bg="bg-orange-50"
          label="Leads Mornos" value={stats?.warmLeads ?? 0}
          sub={stats?.totalLeads ? `${Math.round(((stats?.warmLeads ?? 0) / stats.totalLeads) * 100)}% do total` : "—"}
          subColor="text-orange-500" />
        <StatCard icon={<Snowflake size={18} className="text-blue-400" />} bg="bg-sky-50"
          label="Leads Frios" value={stats?.coldLeads ?? 0}
          sub={stats?.totalLeads ? `${Math.round(((stats?.coldLeads ?? 0) / stats.totalLeads) * 100)}% do total` : "—"}
          subColor="text-blue-400" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
              <TrendingUp size={16} className="text-purple-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Nicho com maior oportunidade</div>
              <div className="font-semibold text-slate-900">{stats?.topNiche ?? "—"}</div>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-yellow-50">
              <Star size={16} className="text-yellow-500" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Média de score</div>
              <div className="font-semibold text-slate-900">{stats?.avgScore ?? 0} / 100</div>
            </div>
          </div>
        </CardContent></Card>
        <Card><CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
              <Clock size={16} className="text-green-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500">Última busca</div>
              <div className="font-semibold text-slate-900">
                {stats?.lastSearchAt ? timeAgo(stats.lastSearchAt) : "Nenhuma ainda"}
              </div>
            </div>
          </div>
        </CardContent></Card>
      </div>

      {isEmpty ? (
        <Card className="border-dashed border-2">
          <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
            <div className="h-14 w-14 rounded-full bg-blue-50 flex items-center justify-center">
              <Users size={24} className="text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 mb-1">Nenhum lead ainda</h3>
              <p className="text-sm text-slate-500 max-w-sm">
                Crie uma campanha de busca e execute-a para começar a prospectar leads reais.
              </p>
            </div>
            <Link href="/searches/new">
              <Button size="sm">Criar primeira busca</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Charts */}
          <div className="grid grid-cols-5 gap-4">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle className="text-sm">Leads por dia (últimos 7 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorHot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                    <Area type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={2} fill="url(#colorLeads)" name="Total" />
                    <Area type="monotone" dataKey="hot" stroke="#ef4444" strokeWidth={2} fill="url(#colorHot)" name="Quentes" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {nicheData.length > 0 && (
              <Card className="col-span-2">
                <CardHeader>
                  <CardTitle className="text-sm">Leads por nicho</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={nicheData} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                      <Bar dataKey="leads" radius={[0, 4, 4, 0]} name="Leads">
                        {nicheData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Leads recentes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Leads recentes</CardTitle>
                <div className="flex items-center gap-2">
                  <Select className="h-7 text-xs w-36" value={filterNiche} onChange={(e) => setFilterNiche(e.target.value)}>
                    <option value="">Todos os nichos</option>
                    {niches.map((n) => <option key={n} value={n!}>{n}</option>)}
                  </Select>
                  <Select className="h-7 text-xs w-28" value={filterTemp} onChange={(e) => setFilterTemp(e.target.value)}>
                    <option value="">Temperatura</option>
                    <option value="hot">Quente</option>
                    <option value="warm">Morno</option>
                    <option value="cold">Frio</option>
                  </Select>
                  <Select className="h-7 text-xs w-28" value={filterScore} onChange={(e) => setFilterScore(e.target.value)}>
                    <option value="">Score mín.</option>
                    <option value="70">70+</option>
                    <option value="50">50+</option>
                    <option value="30">30+</option>
                  </Select>
                  <button onClick={loadData} disabled={refreshing} className="flex h-7 w-7 items-center justify-center rounded-md hover:bg-slate-100 transition-colors">
                    <RefreshCw size={12} className={refreshing ? "animate-spin text-blue-500" : "text-slate-400"} />
                  </button>
                  <Link href="/leads">
                    <Button size="sm" variant="ghost" className="text-xs gap-1">Ver todos <ArrowRight size={12} /></Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3">
              <div className="space-y-2">
                {filtered.map((lead) => (
                  <Link key={lead.id} href={`/leads/${lead.id}`}>
                    <div className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 hover:bg-slate-100 hover:border-slate-200 transition-all cursor-pointer group">
                      <div className="flex flex-col items-center shrink-0 w-12">
                        <div className={`text-xl font-bold ${getScoreColor(lead.score)}`}>{lead.score}</div>
                        <div className="text-[10px] text-slate-400">score</div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm text-slate-900 truncate">{lead.name}</span>
                          <Badge variant="outline" className="text-[10px] py-0">{lead.niche}</Badge>
                          <span className={`inline-flex items-center rounded-full px-2 py-0 text-[10px] font-medium border ${getTemperatureColor(lead.temperature)}`}>
                            {getTemperatureLabel(lead.temperature)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><MapPin size={10} />{lead.city}, {lead.state}</span>
                          {lead.website && <span className="flex items-center gap-1"><Globe size={10} />Site</span>}
                          {lead.instagram && <span className="flex items-center gap-1"><AtSign size={10} />Instagram</span>}
                          {lead.email && <span className="flex items-center gap-1"><Mail size={10} />E-mail</span>}
                        </div>
                        <div className="mt-1.5"><Progress value={lead.score} className="h-1" /></div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-medium ${getStatusColor(lead.status)}`}>
                          {getStatusLabel(lead.status)}
                        </span>
                        <span className="text-[10px] text-slate-400">{timeAgo(lead.createdAt ?? lead.created_at ?? "")}</span>
                        <ArrowRight size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
                {filtered.length === 0 && (
                  <div className="text-center py-8 text-slate-400 text-sm">Nenhum lead com os filtros selecionados.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Campanhas ativas */}
      {campaigns.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Campanhas ativas</CardTitle>
              <Link href="/searches">
                <Button size="sm" variant="ghost" className="text-xs gap-1">Ver todas <ArrowRight size={12} /></Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="space-y-2">
              {campaigns.slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center gap-4 rounded-lg border border-slate-100 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm">{c.name}</span>
                      <Badge variant={c.status === "active" ? "success" : "secondary"} className="text-[10px]">
                        {c.status === "active" ? "Ativa" : "Pausada"}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400">{c.niche} · {c.location}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-semibold text-sm text-slate-900">{c.leads_found ?? 0}</div>
                    <div className="text-[10px] text-slate-400">leads</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-500">
                      {c.frequency === "daily" ? "Diária" : c.frequency === "weekly" ? "Semanal" : "Manual"}
                    </div>
                    {c.last_run_at && <div className="text-[10px] text-slate-400">{timeAgo(c.last_run_at)}</div>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function StatCard({ icon, bg, label, value, sub, subColor }: {
  icon: React.ReactNode; bg: string; label: string;
  value: number; sub: string; subColor: string;
}) {
  return (
    <Card><CardContent className="pt-4 pb-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-slate-500 mb-1">{label}</div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
          <div className={`text-xs mt-0.5 font-medium ${subColor}`}>{sub}</div>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>{icon}</div>
      </div>
    </CardContent></Card>
  );
}
