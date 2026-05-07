"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Zap, Bell, Shield, Database, Key, Trash2, CheckCircle, Info,
  Globe, Clock, RefreshCw, AlertTriangle,
} from "lucide-react";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${checked ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${checked ? "translate-x-5" : "translate-x-1"}`} />
    </button>
  );
}

export function SettingsContent() {
  const [autoSearch, setAutoSearch] = useState(true);
  const [notifyHot, setNotifyHot] = useState(true);
  const [notifyEmail, setNotifyEmail] = useState(false);
  const [respectRobots, setRespectRobots] = useState(true);
  const [rateLimiting, setRateLimiting] = useState(true);
  const [autoDelete, setAutoDelete] = useState(false);
  const [retention, setRetention] = useState("365");

  return (
    <div className="p-6 max-w-3xl space-y-5">
      {/* Auto search */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap size={14} className="text-yellow-500" />
            Busca automática
          </CardTitle>
          <CardDescription>Configure as buscas periódicas automáticas.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-slate-900">Ativar busca automática</div>
              <div className="text-xs text-slate-500">O sistema busca novos leads automaticamente.</div>
            </div>
            <Toggle checked={autoSearch} onChange={setAutoSearch} />
          </div>

          {autoSearch && (
            <div className="rounded-lg bg-slate-50 border border-slate-100 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Frequência padrão</label>
                  <Select>
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Horário preferencial</label>
                  <Input type="time" defaultValue="06:00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Score mínimo para salvar</label>
                  <Select>
                    <option value="50">50+</option>
                    <option value="60">60+</option>
                    <option value="70">70+</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Máx. leads por busca</label>
                  <Input type="number" defaultValue={50} min={10} max={500} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Bell size={14} className="text-blue-500" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Notificar ao encontrar lead quente</div>
              <div className="text-xs text-slate-500">Alerta imediato quando score ≥ 70</div>
            </div>
            <Toggle checked={notifyHot} onChange={setNotifyHot} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium">Notificação por e-mail</div>
              <div className="text-xs text-slate-500">Receber resumo diário por e-mail</div>
            </div>
            <Toggle checked={notifyEmail} onChange={setNotifyEmail} />
          </div>
          {notifyEmail && (
            <Input placeholder="E-mail para notificações" defaultValue="admin@metrikamarketing.com.br" />
          )}
        </CardContent>
      </Card>

      {/* LGPD */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield size={14} className="text-green-600" />
            LGPD e privacidade
          </CardTitle>
          <CardDescription>Configure as políticas de dados e conformidade com a LGPD.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-green-50 border border-green-200 p-3">
            <CheckCircle size={14} className="text-green-600 mt-0.5 shrink-0" />
            <div className="text-xs text-green-800">
              O Lead Radar coleta apenas dados públicos disponíveis em fontes abertas. Todos os dados importados manualmente requerem consentimento explícito do usuário. Registros de coleta são mantidos para auditoria.
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Respeitar robots.txt</div>
                <div className="text-xs text-slate-500">Nunca coletar dados de páginas que proíbem scraping</div>
              </div>
              <Toggle checked={respectRobots} onChange={setRespectRobots} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Rate limiting</div>
                <div className="text-xs text-slate-500">Limitar requisições para não sobrecarregar fontes</div>
              </div>
              <Toggle checked={rateLimiting} onChange={setRateLimiting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5 flex items-center gap-1">
                <Clock size={11} />Retenção de dados
              </label>
              <Select value={retention} onChange={(e) => setRetention(e.target.value)}>
                <option value="90">90 dias</option>
                <option value="180">180 dias</option>
                <option value="365">1 ano</option>
                <option value="730">2 anos</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Exclusão automática</label>
              <div className="flex items-center gap-2 h-9">
                <Toggle checked={autoDelete} onChange={setAutoDelete} />
                <span className="text-xs text-slate-500">Apagar após período</span>
              </div>
            </div>
          </div>

          <div>
            <Button variant="outline" size="sm" className="text-xs text-red-600 border-red-200 hover:bg-red-50 gap-1">
              <Trash2 size={12} />
              Solicitar exclusão de todos os dados
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Key size={14} className="text-purple-600" />
            Integrações e APIs
          </CardTitle>
          <CardDescription>Configure as chaves de API para as fontes de dados.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0 space-y-3">
          {[
            { label: "Google Maps API Key", placeholder: "AIza...", status: "connected" },
            { label: "Google Search API Key", placeholder: "AIza...", status: "disconnected" },
            { label: "Meta (Facebook) App Token", placeholder: "EAABsbCS...", status: "connected" },
            { label: "LinkedIn API Token", placeholder: "Bearer ...", status: "disconnected" },
            { label: "HubSpot API Key", placeholder: "pat-na1-...", status: "disconnected" },
            { label: "RD Station Client ID", placeholder: "...", status: "disconnected" },
          ].map((integration) => (
            <div key={integration.label}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-700">{integration.label}</label>
                <Badge variant={integration.status === "connected" ? "success" : "secondary"} className="text-[10px]">
                  {integration.status === "connected" ? "Conectado" : "Não conectado"}
                </Badge>
              </div>
              <Input
                type="password"
                placeholder={integration.placeholder}
                defaultValue={integration.status === "connected" ? "••••••••••••••••" : ""}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Audit log */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Database size={14} className="text-slate-500" />
            Log de auditoria
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-1.5 text-xs">
            {[
              { action: "Busca automática executada", campaign: "Especialistas SP — Lançamentos", time: "05/05 08:00", ok: true },
              { action: "14 leads coletados", campaign: "Saúde & Bem-estar — BH e SP", time: "05/05 08:00", ok: true },
              { action: "Exportação CSV gerada", campaign: "31 leads exportados", time: "05/05 08:14", ok: true },
              { action: "Rate limit atingido", campaign: "Google Maps API", time: "04/05 22:13", ok: false },
            ].map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 border-b border-slate-100 last:border-0">
                {log.ok
                  ? <CheckCircle size={12} className="text-green-500 shrink-0" />
                  : <AlertTriangle size={12} className="text-orange-500 shrink-0" />}
                <span className="flex-1 text-slate-700">{log.action}</span>
                <span className="text-slate-400">{log.campaign}</span>
                <span className="text-slate-400">{log.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button size="sm">Salvar configurações</Button>
      </div>
    </div>
  );
}
