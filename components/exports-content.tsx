"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/lib/types";
import {
  FileSpreadsheet, FileDown, Database, Webhook, CheckCircle,
  Download, Link, Settings, Filter,
} from "lucide-react";

const exportTargets = [
  { id: "csv", label: "CSV", description: "Arquivo separado por vírgulas, compatível com qualquer planilha.", icon: FileDown, color: "text-slate-600", bg: "bg-slate-50" },
  { id: "excel", label: "Excel (CSV formatado)", description: "CSV com separador ponto-e-vírgula para abrir diretamente no Excel.", icon: FileSpreadsheet, color: "text-green-600", bg: "bg-green-50" },
  { id: "webhook", label: "Make / Zapier (Webhook)", description: "Enviar dados via webhook para qualquer automação.", icon: Webhook, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "hubspot", label: "HubSpot (em breve)", description: "Importar leads como contatos no HubSpot CRM.", icon: Database, color: "text-orange-400", bg: "bg-orange-50" },
  { id: "pipedrive", label: "Pipedrive (em breve)", description: "Criar negócios no Pipedrive com dados do lead.", icon: Database, color: "text-purple-400", bg: "bg-purple-50" },
  { id: "rd_station", label: "RD Station (em breve)", description: "Enviar leads como oportunidades no RD Station CRM.", icon: Database, color: "text-red-400", bg: "bg-red-50" },
];

const exportFields: { key: keyof Lead | string; label: string }[] = [
  { key: "name", label: "Nome" },
  { key: "niche", label: "Nicho" },
  { key: "subniche", label: "Subnicho" },
  { key: "city", label: "Cidade" },
  { key: "state", label: "Estado" },
  { key: "website", label: "Site" },
  { key: "instagram", label: "Instagram" },
  { key: "email", label: "E-mail" },
  { key: "phone", label: "Telefone" },
  { key: "score", label: "Score" },
  { key: "temperature", label: "Temperatura" },
  { key: "opportunity", label: "Oportunidade" },
  { key: "suggested_message", label: "Mensagem sugerida" },
  { key: "status", label: "Status" },
  { key: "source", label: "Fonte" },
];

function leadsToCSV(leads: Lead[], fields: string[], separator = ","): string {
  const fieldDefs = exportFields.filter((f) => fields.includes(f.label));
  const header = fieldDefs.map((f) => `"${f.label}"`).join(separator);
  const rows = leads.map((lead) =>
    fieldDefs.map((f) => {
      const l = lead as unknown as Record<string, unknown>;
      const raw = l[f.key as string] ?? l[f.key.toString().replace(/_([a-z])/g, (_, c: string) => c.toUpperCase())] ?? "";
      const val = Array.isArray(raw) ? raw.join("; ") : String(raw ?? "");
      return `"${val.replace(/"/g, '""')}"`;
    }).join(separator)
  );
  return [header, ...rows].join("\n");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob(["﻿" + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportsContent() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [filterTemp, setFilterTemp] = useState("");
  const [filterNiche, setFilterNiche] = useState("");
  const [filterMinScore, setFilterMinScore] = useState("");
  const [fields, setFields] = useState<string[]>(exportFields.slice(0, 12).map((f) => f.label));
  const [webhookUrl, setWebhookUrl] = useState("");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => (r.ok ? r.json() : []))
      .then(setLeads)
      .finally(() => setLoading(false));
  }, []);

  const toggleTarget = (id: string) => {
    const comingSoon = ["hubspot", "pipedrive", "rd_station"];
    if (comingSoon.includes(id)) { alert("Esta integração estará disponível em breve!"); return; }
    setSelected((s) => s.includes(id) ? s.filter((v) => v !== id) : [...s, id]);
  };

  const toggleField = (label: string) => {
    setFields((ff) => ff.includes(label) ? ff.filter((v) => v !== label) : [...ff, label]);
  };

  const niches = [...new Set(leads.map((l) => l.niche).filter(Boolean))];

  const filtered = leads.filter((l) => {
    if (filterTemp && l.temperature !== filterTemp) return false;
    if (filterNiche && l.niche !== filterNiche) return false;
    if (filterMinScore && l.score < parseInt(filterMinScore)) return false;
    return true;
  });

  const handleExport = async () => {
    if (selected.length === 0) return;
    setExporting(true);
    try {
      const timestamp = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "h");

      if (selected.includes("csv")) {
        const csv = leadsToCSV(filtered, fields, ",");
        downloadFile(csv, `leads_${timestamp}.csv`, "text/csv;charset=utf-8");
      }

      if (selected.includes("excel")) {
        const csv = leadsToCSV(filtered, fields, ";");
        downloadFile(csv, `leads_${timestamp}.xlsx.csv`, "text/csv;charset=utf-8");
      }

      if (selected.includes("webhook") && webhookUrl) {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leads: filtered, exportedAt: new Date().toISOString() }),
        });
        if (res.ok) {
          alert(`Webhook enviado com sucesso! ${filtered.length} leads enviados.`);
        } else {
          alert("Erro ao enviar webhook. Verifique a URL e tente novamente.");
        }
      } else if (selected.includes("webhook") && !webhookUrl) {
        alert("Informe a URL do webhook antes de exportar.");
      }
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl space-y-6">
      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />
            Filtrar leads para exportar
          </CardTitle>
          <CardDescription>Escolha quais leads serão incluídos na exportação.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3 flex-wrap">
            <Select className="w-36" value={filterTemp} onChange={(e) => setFilterTemp(e.target.value)}>
              <option value="">Toda temperatura</option>
              <option value="hot">Quentes</option>
              <option value="warm">Mornos</option>
              <option value="cold">Frios</option>
            </Select>
            <Select className="w-40" value={filterNiche} onChange={(e) => setFilterNiche(e.target.value)}>
              <option value="">Todos os nichos</option>
              {niches.map((n) => <option key={n} value={n!}>{n}</option>)}
            </Select>
            <Select className="w-36" value={filterMinScore} onChange={(e) => setFilterMinScore(e.target.value)}>
              <option value="">Score mínimo</option>
              <option value="70">70+ (quentes)</option>
              <option value="50">50+ (mornos+)</option>
              <option value="30">30+</option>
            </Select>
            <div className="ml-auto text-sm text-slate-600">
              {loading ? "Carregando..." : <><span className="font-bold text-slate-900">{filtered.length}</span> leads selecionados</>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Destination */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Destino da exportação</CardTitle>
          <CardDescription>Selecione um ou mais destinos.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-2 gap-3">
            {exportTargets.map((target) => {
              const Icon = target.icon;
              const isSelected = selected.includes(target.id);
              const comingSoon = ["hubspot", "pipedrive", "rd_station"].includes(target.id);
              return (
                <button
                  key={target.id}
                  onClick={() => toggleTarget(target.id)}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                    isSelected ? "border-blue-400 bg-blue-50 shadow-sm" : comingSoon ? "border-slate-100 bg-slate-50 opacity-60 cursor-not-allowed" : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${target.bg} shrink-0`}>
                    <Icon size={18} className={target.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900">{target.label}</span>
                      {isSelected && <CheckCircle size={13} className="text-blue-600" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{target.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {selected.includes("webhook") && (
            <div className="mt-4 rounded-lg bg-violet-50 border border-violet-200 p-4">
              <label className="block text-xs font-medium text-violet-800 mb-2 flex items-center gap-1">
                <Link size={12} />URL do Webhook (Make, Zapier, n8n...)
              </label>
              <Input
                className="bg-white"
                placeholder="https://hook.make.com/..."
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fields */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings size={14} className="text-slate-500" />
            Campos a exportar
          </CardTitle>
          <CardDescription>Escolha quais informações incluir no arquivo.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2">
            {exportFields.map((f) => (
              <button
                key={f.label}
                onClick={() => toggleField(f.label)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  fields.includes(f.label)
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">{fields.length} campos selecionados</p>
        </CardContent>
      </Card>

      {/* Export button */}
      <div className="flex items-center justify-between rounded-xl bg-slate-900 p-5">
        <div>
          <div className="text-white font-semibold">Pronto para exportar</div>
          <div className="text-slate-400 text-sm mt-0.5">
            {filtered.length} leads · {fields.length} campos · {selected.length} destinos
          </div>
        </div>
        <Button
          className="bg-blue-500 hover:bg-blue-400 text-white gap-2"
          disabled={selected.length === 0 || exporting || filtered.length === 0}
          onClick={handleExport}
        >
          {exporting ? (
            <><div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Exportando...</>
          ) : (
            <><Download size={15} /> Exportar agora</>
          )}
        </Button>
      </div>
    </div>
  );
}
