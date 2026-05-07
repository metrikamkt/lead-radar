"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { X, Plus, Search, Sparkles, Zap } from "lucide-react";

const nicheSuggestions = [
  "Clínicas de Estética", "Infoprodutores", "Experts", "E-commerces",
  "Academias", "Consultórios", "Imobiliárias", "Advogados", "Restaurantes",
  "Prestadores de Serviço", "Coaches", "Fotógrafos", "Agências",
];

const keywordSuggestions = [
  "lançamento", "mentoria", "aula gratuita", "inscrições abertas",
  "lista de espera", "consultoria", "agenda aberta", "tráfego pago",
  "vendas online", "funil", "curso online", "método", "transformação",
  "diagnóstico", "vagas limitadas", "turma nova",
];

const signalOptions = [
  { value: "advertising", label: "Está anunciando (Meta/Google Ads)" },
  { value: "sales_page", label: "Tem página de vendas" },
  { value: "form_capture", label: "Tem formulário de captura" },
  { value: "checkout", label: "Tem checkout/link de pagamento" },
  { value: "intent_terms", label: "Usa termos de intenção" },
  { value: "hiring", label: "Contratando marketing/tráfego" },
  { value: "launch", label: "Lançamento ativo" },
  { value: "weak_site", label: "Site com problemas (oportunidade)" },
];

const sourceOptions = [
  { value: "google_maps", label: "Google Maps" },
  { value: "instagram", label: "Instagram" },
  { value: "meta_ads", label: "Meta Ads Library" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "google_search", label: "Google Search" },
  { value: "google_business", label: "Google Business Profile" },
  { value: "manual", label: "Inserção manual" },
  { value: "import", label: "Importação de planilha" },
];

export function NewSearchForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    niche: "",
    customNiche: "",
    location: "",
    keywords: [] as string[],
    newKeyword: "",
    signals: [] as string[],
    sources: ["google_maps"] as string[],
    minScore: "30",
    maxLeads: "20",
    frequency: "manual",
  });

  const toggleItem = (field: "keywords" | "signals" | "sources", value: string) => {
    setForm((f) => ({
      ...f,
      [field]: f[field].includes(value)
        ? f[field].filter((v) => v !== value)
        : [...f[field], value],
    }));
  };

  const addKeyword = () => {
    if (form.newKeyword.trim() && !form.keywords.includes(form.newKeyword.trim())) {
      setForm((f) => ({ ...f, keywords: [...f.keywords, f.newKeyword.trim()], newKeyword: "" }));
    }
  };

  const resolvedNiche = form.niche === "custom" ? form.customNiche : form.niche;

  const handleSubmit = async () => {
    setError("");
    if (!form.name.trim() || !resolvedNiche || !form.location.trim()) {
      setError("Preencha nome, nicho e localização antes de continuar.");
      return;
    }

    setSaving(true);
    try {
      // 1. Salvar campanha
      const campaignRes = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          niche: resolvedNiche,
          location: form.location,
          keywords: form.keywords,
          signals: form.signals,
          sources: form.sources,
          min_score: parseInt(form.minScore),
          max_leads: parseInt(form.maxLeads),
          frequency: form.frequency,
          status: "active",
        }),
      });

      if (!campaignRes.ok) {
        const d = await campaignRes.json();
        setError(d.error ?? "Erro ao criar campanha.");
        return;
      }

      const campaign = await campaignRes.json();

      // 2. Executar busca imediatamente
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: campaign.id,
          niche: resolvedNiche,
          location: form.location,
          keywords: form.keywords,
          maxLeads: parseInt(form.maxLeads),
          minScore: parseInt(form.minScore),
        }),
      });

      const searchData = await searchRes.json();

      if (!searchRes.ok) {
        // Campanha criada mas busca falhou (ex: chave Google ausente)
        alert(`Campanha criada! Mas a busca automática falhou: ${searchData.error ?? "erro desconhecido"}.\n\nVocê pode executar a busca manualmente na página de campanhas.`);
      } else {
        alert(`Campanha criada e busca executada!\n${searchData.saved} leads salvos de ${searchData.found} encontrados.`);
      }

      router.push("/searches");
    } catch (err) {
      setError("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 4;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          {["Básico", "Palavras-chave", "Sinais & Fontes", "Configurações"].map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                step > i + 1 ? "bg-green-500 text-white" : step === i + 1 ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
              }`}>
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-xs font-medium ${step === i + 1 ? "text-slate-900" : "text-slate-400"}`}>{label}</span>
              {i < 3 && <div className="w-8 h-px bg-slate-200 ml-2" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Basic info */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Informações básicas</CardTitle>
            <CardDescription>Defina o nome, nicho e localização da busca.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Nome da busca *</label>
              <Input
                placeholder="Ex: Clínicas SP — Sem site"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Nicho *</label>
              <Select value={form.niche} onChange={(e) => setForm((f) => ({ ...f, niche: e.target.value }))}>
                <option value="">Selecione um nicho</option>
                {nicheSuggestions.map((n) => <option key={n} value={n}>{n}</option>)}
                <option value="custom">Outro (personalizado)</option>
              </Select>
              {form.niche === "custom" && (
                <Input
                  className="mt-2"
                  placeholder="Digite o nicho personalizado"
                  value={form.customNiche}
                  onChange={(e) => setForm((f) => ({ ...f, customNiche: e.target.value }))}
                />
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Localização *</label>
              <Input
                placeholder="Ex: São Paulo, SP"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
              <p className="text-xs text-slate-400 mt-1">Use cidade + estado ou apenas o estado para buscas mais amplas.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Keywords */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Palavras-chave</CardTitle>
            <CardDescription>Termos que indicam intenção comercial no nicho escolhido.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {form.keywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.keywords.map((kw) => (
                  <span key={kw} className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs text-blue-700">
                    {kw}
                    <button onClick={() => toggleItem("keywords", kw)} className="hover:text-blue-900"><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar palavra-chave..."
                value={form.newKeyword}
                onChange={(e) => setForm((f) => ({ ...f, newKeyword: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addKeyword()}
              />
              <Button size="sm" variant="outline" onClick={addKeyword}><Plus size={14} /></Button>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-2 flex items-center gap-1">
                <Sparkles size={12} className="text-yellow-500" />
                Sugestões
              </div>
              <div className="flex flex-wrap gap-1.5">
                {keywordSuggestions.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => toggleItem("keywords", kw)}
                    className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                      form.keywords.includes(kw)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600"
                    }`}
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Signals & Sources */}
      {step === 3 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sinais de intenção</CardTitle>
              <CardDescription>Quais sinais você quer identificar nos leads?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {signalOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleItem("signals", opt.value)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                      form.signals.includes(opt.value)
                        ? "border-blue-300 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      form.signals.includes(opt.value) ? "border-blue-500 bg-blue-500" : "border-slate-300"
                    }`}>
                      {form.signals.includes(opt.value) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fontes de dados</CardTitle>
              <CardDescription>Google Maps está sempre ativo. Outras fontes serão suportadas em breve.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {sourceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleItem("sources", opt.value)}
                    className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-colors ${
                      form.sources.includes(opt.value)
                        ? "border-blue-300 bg-blue-50 text-blue-800"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    <div className={`h-4 w-4 rounded border-2 flex items-center justify-center shrink-0 ${
                      form.sources.includes(opt.value) ? "border-blue-500 bg-blue-500" : "border-slate-300"
                    }`}>
                      {form.sources.includes(opt.value) && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className="text-xs">{opt.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 4: Settings */}
      {step === 4 && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da busca</CardTitle>
              <CardDescription>Defina limites e frequência da campanha.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Score mínimo para salvar</label>
                  <Select value={form.minScore} onChange={(e) => setForm((f) => ({ ...f, minScore: e.target.value }))}>
                    <option value="0">0 — Salvar todos</option>
                    <option value="30">30 — Com algum dado</option>
                    <option value="50">50 — Com algum sinal</option>
                    <option value="70">70 — Apenas quentes</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1.5">Quantidade máxima</label>
                  <Select value={form.maxLeads} onChange={(e) => setForm((f) => ({ ...f, maxLeads: e.target.value }))}>
                    <option value="10">10 leads</option>
                    <option value="20">20 leads</option>
                    <option value="50">50 leads</option>
                    <option value="100">100 leads</option>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Frequência da busca</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "manual", label: "Manual" },
                    { value: "daily", label: "Diária" },
                    { value: "weekly", label: "Semanal" },
                    { value: "monthly", label: "Mensal" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setForm((f) => ({ ...f, frequency: opt.value }))}
                      className={`rounded-lg border py-3 text-xs font-medium transition-colors ${
                        form.frequency === opt.value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-slate-200 text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-blue-50/50">
            <CardContent className="pt-4 pb-4">
              <div className="text-xs font-semibold text-blue-800 mb-2">Resumo da campanha</div>
              <div className="space-y-1 text-xs text-blue-700">
                <div><span className="font-medium">Nome:</span> {form.name || "—"}</div>
                <div><span className="font-medium">Nicho:</span> {resolvedNiche || "—"}</div>
                <div><span className="font-medium">Local:</span> {form.location || "—"}</div>
                <div><span className="font-medium">Palavras-chave:</span> {form.keywords.length > 0 ? form.keywords.join(", ") : "—"}</div>
                <div><span className="font-medium">Fontes:</span> {form.sources.length} selecionadas</div>
                <div><span className="font-medium">Score mín.:</span> {form.minScore} | Máx leads: {form.maxLeads}</div>
              </div>
            </CardContent>
          </Card>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1 || saving}
        >
          Voltar
        </Button>

        {step < totalSteps ? (
          <Button size="sm" onClick={() => setStep((s) => s + 1)}>
            Próximo →
          </Button>
        ) : (
          <Button size="sm" onClick={handleSubmit} disabled={saving} className="gap-2">
            {saving ? (
              <><div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Buscando leads...</>
            ) : (
              <><Zap size={14} /> Criar campanha e buscar</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
