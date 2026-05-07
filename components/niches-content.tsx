"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getScoreColor } from "@/lib/scoring";
import Link from "next/link";
import { Flame, Thermometer, Snowflake, TrendingUp, AlertCircle, MessageSquare, ArrowRight } from "lucide-react";
import { Lead } from "@/lib/types";

interface NicheSummary {
  niche: string;
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  avgScore: number;
  topLeads: Lead[];
}

function buildNicheSummaries(leads: Lead[]): NicheSummary[] {
  const nicheMap = new Map<string, Lead[]>();
  for (const lead of leads) {
    if (!lead.niche) continue;
    const list = nicheMap.get(lead.niche) ?? [];
    list.push(lead);
    nicheMap.set(lead.niche, list);
  }

  const summaries: NicheSummary[] = [];
  for (const [niche, list] of nicheMap.entries()) {
    const avgScore = list.length
      ? Math.round(list.reduce((s, l) => s + l.score, 0) / list.length)
      : 0;
    summaries.push({
      niche,
      totalLeads: list.length,
      hotLeads: list.filter((l) => l.temperature === "hot").length,
      warmLeads: list.filter((l) => l.temperature === "warm").length,
      coldLeads: list.filter((l) => l.temperature === "cold").length,
      avgScore,
      topLeads: [...list].sort((a, b) => b.score - a.score).slice(0, 3),
    });
  }

  return summaries.sort((a, b) => b.totalLeads - a.totalLeads);
}

const nicheSignals: Record<string, string[]> = {
  "Clínicas de Estética": ["Agenda online", "Anúncios ativos", "Instagram ativo"],
  "Academias": ["Promoção de matrícula", "Aula grátis", "Site desatualizado"],
  "Consultórios": ["Sem agendamento online", "Pouca presença digital"],
  "Imobiliárias": ["Anúncios de imóveis", "Landing pages", "CRM ativo"],
  "Restaurantes": ["Cardápio digital", "iFood/Rappi", "Google Maps ativo"],
  "Advogados": ["Blog jurídico", "Formulário de contato", "LinkedIn ativo"],
  "Infoprodutores": ["Lançamentos", "Grupo WhatsApp", "Página de vendas"],
};

const nichePains: Record<string, string[]> = {
  "Clínicas de Estética": ["Dependência de indicações", "Sem captação ativa"],
  "Academias": ["Alta churn", "Pouca retenção de alunos"],
  "Consultórios": ["Agenda subutilizada", "Sem follow-up digital"],
  "Imobiliárias": ["Leads frios no funil", "Pouca qualificação"],
  "Restaurantes": ["Dependência de delivery", "Sem base de clientes"],
  "Advogados": ["Captação irregular", "Sem autoridade online"],
  "Infoprodutores": ["Listas pequenas", "Baixa conversão"],
};

const nicheApproach: Record<string, string> = {
  "Clínicas de Estética": "Mostrar como outras clínicas dobram agendamentos com tráfego pago + página de captura.",
  "Academias": "Focar em campanha de matrícula com urgência e aulas gratuitas como isca.",
  "Consultórios": "Apresentar agendamento online e automação de WhatsApp como diferenciais.",
  "Imobiliárias": "Mostrar landing pages de captação de interessados em imóveis específicos.",
  "Restaurantes": "Oferecer estratégia de fidelização via WhatsApp e listas de transmissão.",
  "Advogados": "Destacar produção de conteúdo jurídico + captação de leads qualificados.",
  "Infoprodutores": "Trabalhar estrutura de lançamento e funil de e-mails para lista.",
};

export function NichesContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setLeads(data))
      .finally(() => setLoading(false));
  }, []);

  const summaries = buildNicheSummaries(leads);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-7 w-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (summaries.length === 0) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-16 flex flex-col items-center gap-3 text-center">
            <div className="text-sm font-medium text-slate-700">Nenhum lead encontrado</div>
            <div className="text-xs text-slate-400">Execute uma busca para ver os nichos aparecerem aqui.</div>
            <Link href="/searches/new" className="text-blue-600 text-xs underline">Criar primeira busca</Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {summaries.map((summary) => {
          const signals = nicheSignals[summary.niche] ?? ["Presença digital", "Contato disponível"];
          const pains = nichePains[summary.niche] ?? ["Captação manual", "Sem automação"];
          const approach = nicheApproach[summary.niche] ?? "Apresentar solução de captação digital personalizada para o nicho.";

          return (
            <Card key={summary.niche} className="hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{summary.niche}</CardTitle>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm text-slate-500">{summary.totalLeads} leads</span>
                      <div className="flex items-center gap-1 text-xs">
                        <Flame size={11} className="text-red-500" /><span className="text-red-500 font-medium">{summary.hotLeads}</span>
                        <Thermometer size={11} className="text-orange-500 ml-1" /><span className="text-orange-500 font-medium">{summary.warmLeads}</span>
                        <Snowflake size={11} className="text-blue-400 ml-1" /><span className="text-blue-400 font-medium">{summary.coldLeads}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-2xl font-black ${getScoreColor(summary.avgScore)}`}>{summary.avgScore}</div>
                    <div className="text-xs text-slate-400">avg score</div>
                  </div>
                </div>
                <Progress value={summary.avgScore} className="mt-2" />
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-600">
                    <TrendingUp size={12} className="text-green-500" />
                    Principais sinais
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {signals.map((s) => (
                      <span key={s} className="inline-flex items-center rounded-full bg-green-50 border border-green-100 px-2 py-0.5 text-[11px] text-green-700">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-slate-600">
                    <AlertCircle size={12} className="text-orange-500" />
                    Principais dores
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pains.map((p) => (
                      <span key={p} className="inline-flex items-center rounded-full bg-orange-50 border border-orange-100 px-2 py-0.5 text-[11px] text-orange-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                  <div className="flex items-center gap-1.5 mb-1 text-xs font-semibold text-blue-700">
                    <MessageSquare size={12} />
                    Melhor abordagem
                  </div>
                  <p className="text-xs text-blue-700 leading-relaxed">{approach}</p>
                </div>

                {summary.topLeads.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-slate-500 mb-2">Top leads</div>
                    <div className="space-y-1">
                      {summary.topLeads.map((l) => (
                        <Link key={l.id} href={`/leads/${l.id}`}>
                          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 hover:bg-slate-100 transition-colors cursor-pointer">
                            <span className="text-xs text-slate-700 font-medium truncate">{l.name}</span>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className={`text-xs font-bold ${getScoreColor(l.score)}`}>{l.score}</span>
                              <ArrowRight size={11} className="text-slate-300" />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
