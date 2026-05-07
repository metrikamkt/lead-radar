"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";
import { Play, Pause, Trash2, ExternalLink, MapPin, Tag, Calendar, Zap, Plus, RefreshCw } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  niche: string;
  location: string;
  frequency: string;
  status: string;
  keywords: string[];
  sources: string[];
  min_score: number;
  max_leads: number;
  leads_found: number;
  last_run_at: string | null;
  created_at: string;
}

const frequencyLabel: Record<string, string> = {
  manual: "Manual",
  daily: "Diária",
  weekly: "Semanal",
  monthly: "Mensal",
};

const sourceLabels: Record<string, string> = {
  instagram: "Instagram",
  meta_ads: "Meta Ads",
  linkedin: "LinkedIn",
  google_search: "Google Search",
  google_maps: "Google Maps",
  google_business: "Google Business",
};

export function SearchesContent() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState<string | null>(null);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/campaigns");
      if (res.ok) setCampaigns(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const toggleStatus = async (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    const res = await fetch(`/api/campaigns/${campaign.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) fetchCampaigns();
  };

  const deleteCampaign = async (id: string) => {
    if (!confirm("Excluir esta campanha? Os leads encontrados serão mantidos.")) return;
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
    fetchCampaigns();
  };

  const runSearch = async (campaign: Campaign) => {
    setRunning(campaign.id);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          niche: campaign.niche,
          location: campaign.location,
          keywords: campaign.keywords ?? [],
          maxLeads: campaign.max_leads ?? 20,
          minScore: campaign.min_score ?? 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? "Erro ao executar busca.");
      } else {
        alert(`Busca concluída! ${data.saved} leads salvos de ${data.found} encontrados.`);
        fetchCampaigns();
      }
    } finally {
      setRunning(null);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">
          {loading ? "Carregando..." : `${campaigns.length} campanhas`}
        </span>
        <Button size="sm" variant="outline" onClick={fetchCampaigns} className="gap-1.5">
          <RefreshCw size={13} />
          Atualizar
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-7 w-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="hover:border-blue-200 transition-colors">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 pt-0.5">
                    <div className={`h-2.5 w-2.5 rounded-full ${campaign.status === "active" ? "bg-green-400 animate-pulse" : "bg-slate-300"}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{campaign.name}</span>
                      <Badge variant={campaign.status === "active" ? "success" : "secondary"}>
                        {campaign.status === "active" ? "Ativa" : campaign.status === "paused" ? "Pausada" : "Concluída"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-3">
                      <span className="flex items-center gap-1"><Tag size={11} />{campaign.niche}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{campaign.location}</span>
                      <span className="flex items-center gap-1"><Calendar size={11} />{frequencyLabel[campaign.frequency] ?? campaign.frequency}</span>
                      {campaign.last_run_at && (
                        <span className="flex items-center gap-1"><Zap size={11} />Última busca: {timeAgo(campaign.last_run_at)}</span>
                      )}
                    </div>

                    {campaign.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {campaign.keywords.map((kw) => (
                          <span key={kw} className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 text-[11px] text-blue-700">
                            {kw}
                          </span>
                        ))}
                      </div>
                    )}

                    {campaign.sources?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {campaign.sources.map((s) => (
                          <span key={s} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">
                            {sourceLabels[s] || s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 shrink-0 text-right">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{campaign.leads_found ?? 0}</div>
                      <div className="text-xs text-slate-400">leads encontrados</div>
                    </div>
                    <div className="text-xs text-slate-500">
                      Score mín: <span className="font-medium text-slate-700">{campaign.min_score ?? 0}</span>
                    </div>
                    <div className="text-xs text-slate-500">
                      Máx: <span className="font-medium text-slate-700">{campaign.max_leads ?? 20}</span> leads
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs gap-1"
                      onClick={() => runSearch(campaign)}
                      disabled={running === campaign.id}
                    >
                      {running === campaign.id ? (
                        <><div className="h-3 w-3 border border-blue-500 border-t-transparent rounded-full animate-spin" /> Buscando...</>
                      ) : (
                        <><Zap size={12} /> Buscar agora</>
                      )}
                    </Button>
                    <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => toggleStatus(campaign)}>
                      {campaign.status === "active" ? <><Pause size={12} /> Pausar</> : <><Play size={12} /> Ativar</>}
                    </Button>
                    <Link href={`/leads?search=${encodeURIComponent(campaign.niche)}`}>
                      <Button size="sm" variant="ghost" className="text-xs gap-1 w-full">
                        <ExternalLink size={12} /> Ver leads
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs gap-1 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteCampaign(campaign.id)}
                    >
                      <Trash2 size={12} /> Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-dashed">
        <CardContent className="pt-8 pb-8 flex flex-col items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
            <Plus size={18} className="text-slate-400" />
          </div>
          <div className="text-center">
            <div className="text-sm font-medium text-slate-700">Criar nova campanha</div>
            <div className="text-xs text-slate-400 mt-0.5">Configure um nicho, palavras-chave e fontes para iniciar a prospecção.</div>
          </div>
          <Link href="/searches/new">
            <Button size="sm">Nova busca</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
