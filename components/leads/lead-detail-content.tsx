"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { getTemperatureColor, getTemperatureLabel, getScoreColor, getStatusLabel, getStatusColor } from "@/lib/scoring";
import { formatDateTime, timeAgo } from "@/lib/utils";
import { Lead } from "@/lib/types";
import {
  Globe, AtSign, Mail, Phone, MapPin, ExternalLink,
  Download, Send, Edit3, CheckCircle, AlertCircle, TrendingUp,
  MessageSquare, Zap, Star, Copy, Check, Link2, Loader2,
} from "lucide-react";

export function LeadDetailContent({ id }: { id: string }) {
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [observations, setObservations] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "score" | "signals" | "message">("overview");

  useEffect(() => {
    fetch(`/api/leads/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLead(data);
        setStatus(data.status ?? "new");
        setObservations(data.observations ?? "");
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function saveObservations() {
    if (!lead) return;
    setSaving(true);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, observations }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function updateStatus(newStatus: string) {
    setStatus(newStatus);
    await fetch(`/api/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  function copyMessage() {
    if (!lead?.suggestedMessage && !lead?.suggested_message) return;
    navigator.clipboard.writeText(lead.suggestedMessage ?? lead.suggested_message ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-64">
        <Loader2 size={24} className="animate-spin text-blue-500" />
      </div>
    );
  }

  if (!lead) {
    return <div className="p-6 text-center text-slate-400">Lead não encontrado.</div>;
  }

  const msg = lead.suggestedMessage ?? lead.suggested_message ?? "";
  const scoreReason = lead.scoreReason ?? lead.score_reason ?? "";
  const opportunity = lead.opportunity ?? "";
  const problems = lead.problemsFound ?? lead.problems_found ?? [];
  const terms = lead.termsFound ?? lead.terms_found ?? [];
  const signals = lead.signals ?? lead.lead_signals ?? [];
  const createdAt = lead.createdAt ?? lead.created_at ?? "";
  const updatedAt = lead.updatedAt ?? lead.updated_at ?? "";

  return (
    <div className="p-6">
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Header */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-start gap-5">
              <div className="flex flex-col items-center shrink-0">
                <div className={`text-4xl font-black ${getScoreColor(lead.score)}`}>{lead.score}</div>
                <div className="text-xs text-slate-400 mt-0.5">de 100</div>
                <Progress value={lead.score} className="w-16 mt-2" />
                <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${getTemperatureColor(lead.temperature)}`}>
                  {getTemperatureLabel(lead.temperature)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 mb-1">{lead.name}</h2>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      {lead.niche && <Badge variant="outline">{lead.niche}</Badge>}
                      {lead.subniche && <Badge variant="secondary">{lead.subniche}</Badge>}
                      <span className="flex items-center gap-1 text-xs text-slate-400">
                        <MapPin size={11} />{lead.city}, {lead.state}
                      </span>
                      {lead.responsible && (
                        <span className="text-xs text-slate-400">Resp.: <span className="font-medium text-slate-600">{lead.responsible}</span></span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {lead.website && (
                        <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="text-xs gap-1"><Globe size={12} />Site <ExternalLink size={10} /></Button>
                        </a>
                      )}
                      {lead.instagram && (
                        <Button size="sm" variant="outline" className="text-xs gap-1 text-pink-600 border-pink-200">
                          <AtSign size={12} />{lead.instagram}
                        </Button>
                      )}
                      {lead.linkedin && (
                        <Button size="sm" variant="outline" className="text-xs gap-1 text-blue-700 border-blue-200">
                          <Link2 size={12} />LinkedIn
                        </Button>
                      )}
                      {lead.email && (
                        <a href={`mailto:${lead.email}`}>
                          <Button size="sm" variant="outline" className="text-xs gap-1"><Mail size={12} />{lead.email}</Button>
                        </a>
                      )}
                      {lead.phone && (
                        <a href={`https://wa.me/${lead.phone?.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="text-xs gap-1 text-green-700 border-green-200">
                            <Phone size={12} />{lead.phone}
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Status:</span>
                      <Select className="h-7 text-xs w-36" value={status} onChange={(e) => updateStatus(e.target.value)}>
                        <option value="new">Novo</option>
                        <option value="contacted">Contatado</option>
                        <option value="qualified">Qualificado</option>
                        <option value="proposal">Proposta</option>
                        <option value="closed_won">Fechado</option>
                        <option value="closed_lost">Perdido</option>
                        <option value="archived">Arquivado</option>
                      </Select>
                    </div>
                    <Button size="sm" variant="outline" className="text-xs gap-1" onClick={copyMessage}>
                      {copied ? <><Check size={12} />Copiado!</> : <><Copy size={12} />Copiar mensagem</>}
                    </Button>
                    <Button size="sm" className="text-xs gap-1"><Send size={12} />Enviar ao CRM</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200">
          {(["overview", "score", "signals", "message"] as const).map((t) => {
            const labels = { overview: "Visão Geral", score: "Score Detalhado", signals: "Sinais", message: "Mensagem Sugerida" };
            return (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === t ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-900"}`}>
                {labels[t]}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              {opportunity && (
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp size={14} className="text-blue-600" />Oportunidade comercial</CardTitle></CardHeader>
                  <CardContent className="pt-0"><p className="text-sm text-slate-700 leading-relaxed">{opportunity}</p></CardContent>
                </Card>
              )}
              {problems.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><AlertCircle size={14} className="text-orange-500" />Problemas encontrados</CardTitle></CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2">
                      {problems.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                          <div className="mt-0.5 h-4 w-4 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                          </div>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap size={14} className="text-yellow-500" />Fonte de origem</CardTitle></CardHeader>
                <CardContent className="pt-0 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Canal</span>
                    <span className="font-medium">{lead.source}</span>
                  </div>
                  {(lead.sourceUrl ?? lead.source_url) && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Link</span>
                      <a href={lead.sourceUrl ?? lead.source_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                        Ver fonte <ExternalLink size={10} />
                      </a>
                    </div>
                  )}
                  {createdAt && <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Coletado</span><span className="text-slate-700">{formatDateTime(createdAt)}</span></div>}
                  {updatedAt && <div className="flex items-center justify-between text-sm"><span className="text-slate-500">Atualizado</span><span className="text-slate-700">{timeAgo(updatedAt)}</span></div>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Edit3 size={14} className="text-slate-400" />Observações</CardTitle></CardHeader>
                <CardContent className="pt-0">
                  <Textarea placeholder="Adicione observações..." value={observations} onChange={(e) => setObservations(e.target.value)} className="text-sm" rows={3} />
                  <Button size="sm" className="mt-2 text-xs gap-1" onClick={saveObservations} disabled={saving}>
                    {saving ? <Loader2 size={11} className="animate-spin" /> : saved ? <Check size={11} /> : null}
                    {saved ? "Salvo!" : "Salvar"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "score" && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Por que este lead tem {lead.score} pontos?</CardTitle></CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-slate-700 leading-relaxed">{scoreReason || "Score calculado com base nos dados disponíveis."}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Distribuição de pontos</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-3">
                {[
                  { label: "Dados básicos", value: Math.min(20, lead.score * 0.2), max: 20, color: "bg-blue-400" },
                  { label: "Sinais de intenção", value: Math.min(50, lead.score * 0.5), max: 50, color: "bg-green-400" },
                  { label: "Problemas/oportunidades", value: Math.min(30, lead.score * 0.3), max: 30, color: "bg-orange-400" },
                ].map(({ label, value, max, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1 text-xs">
                      <span className="text-slate-600">{label}</span>
                      <span className="font-semibold text-slate-800">{Math.round(value)}/{max} pts</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${(value / max) * 100}%` }} />
                    </div>
                  </div>
                ))}
                <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className={`px-2 py-1 rounded ${lead.score < 40 ? "bg-blue-50 text-blue-700 font-semibold" : ""}`}>0–39 Frio</div>
                    <div className={`px-2 py-1 rounded ${lead.score >= 40 && lead.score < 70 ? "bg-orange-50 text-orange-700 font-semibold" : ""}`}>40–69 Morno</div>
                    <div className={`px-2 py-1 rounded ${lead.score >= 70 ? "bg-red-50 text-red-700 font-semibold" : ""}`}>70–100 Quente</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "signals" && (
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Sinais detectados</CardTitle></CardHeader>
              <CardContent className="pt-0 space-y-2">
                {signals.length > 0 ? signals.map((sig: any) => (
                  <div key={sig.id} className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-100 p-3">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-green-800">{sig.signalDescription ?? sig.signal_description}</div>
                      {sig.sourceUrl && <a href={sig.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-600 hover:underline">Ver fonte →</a>}
                    </div>
                    <div className="text-xs font-bold text-green-700 shrink-0">+{sig.points} pts</div>
                  </div>
                )) : <p className="text-sm text-slate-400">Nenhum sinal específico registrado.</p>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Termos encontrados</CardTitle></CardHeader>
              <CardContent className="pt-0">
                {terms.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {terms.map((t: string) => (
                      <span key={t} className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs text-blue-700">🔍 {t}</span>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-400">Nenhum termo registrado.</p>}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "message" && (
          <div className="max-w-2xl">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2"><MessageSquare size={14} className="text-blue-600" />Mensagem de abordagem sugerida</CardTitle>
                  <Button size="sm" variant="outline" className="text-xs gap-1" onClick={copyMessage}>
                    {copied ? <><Check size={12} />Copiado!</> : <><Copy size={12} />Copiar</>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {msg ? (
                  <>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-700 leading-relaxed italic">"{msg}"</div>
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-blue-50 border border-blue-100 p-3">
                      <Star size={13} className="text-blue-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-blue-700">Personalize antes de enviar — use o nome real do contato e detalhes específicos observados.</p>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">Nenhuma mensagem gerada para este lead.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
