import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface PlaceResult {
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  website?: string;
  rating?: number;
  place_id?: string;
}

interface ScoreResult {
  score: number;
  temperature: "hot" | "warm" | "cold";
  reason: string;
  signals: { type: string; description: string; points: number }[];
  problems: string[];
  opportunity: string;
  suggestedMessage: string;
}

// Calcula score com base nos dados disponíveis
function calculateScore(place: PlaceResult, keywords: string[]): ScoreResult {
  let score = 0;
  const signals: { type: string; description: string; points: number }[] = [];
  const problems: string[] = [];

  // Dados básicos
  if (place.website) { score += 5; signals.push({ type: "website", description: "Possui site", points: 5 }); }
  if (place.formatted_phone_number) { score += 5; signals.push({ type: "phone", description: "Telefone/WhatsApp público", points: 5 }); }

  // Avaliação no Google
  if (place.rating && place.rating >= 4.5) {
    score += 10;
    signals.push({ type: "rating", description: `Avaliação excelente no Google (${place.rating}★)`, points: 10 });
  } else if (place.rating && place.rating >= 4.0) {
    score += 5;
    signals.push({ type: "rating", description: `Boa avaliação no Google (${place.rating}★)`, points: 5 });
  }

  // Verificar sinais via Meta Ads Library (sem chave, acesso público)
  const hasAds = checkMetaAds(place.name);
  if (hasAds) {
    score += 20;
    signals.push({ type: "advertising", description: "Anúncios identificados no Meta Ads Library", points: 20 });
  }

  // Palavras-chave encontradas no nome
  const foundKeywords = keywords.filter((kw) =>
    place.name.toLowerCase().includes(kw.toLowerCase()) ||
    (place.formatted_address || "").toLowerCase().includes(kw.toLowerCase())
  );
  if (foundKeywords.length > 0) {
    score += foundKeywords.length * 5;
    signals.push({ type: "keywords", description: `Palavras-chave encontradas: ${foundKeywords.join(", ")}`, points: foundKeywords.length * 5 });
  }

  // Problemas / oportunidades
  if (!place.website) {
    problems.push("Sem site — oportunidade de presença digital");
    score += 10;
  }
  if (place.website && place.website.includes("facebook.com")) {
    problems.push("Usa Facebook como site — sem domínio próprio");
    score += 8;
  }

  // Limitar score em 100
  score = Math.min(score, 100);

  const temperature: "hot" | "warm" | "cold" = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

  const reasonParts = signals.map((s) => `${s.description} (+${s.points})`);
  if (problems.length) reasonParts.push(...problems.map((p) => `${p} (+pts bônus)`));
  const reason = reasonParts.join(". ") || "Score baseado em dados básicos do Google Maps.";

  const opportunity = buildOpportunity(place, signals, problems);
  const suggestedMessage = buildMessage(place, signals, problems);

  return { score, temperature, reason, signals, problems, opportunity, suggestedMessage };
}

function checkMetaAds(_name: string): boolean {
  // Placeholder — integração real requer chamada à Meta Ads Library API
  // Por ora retorna false; será implementado quando a chave Meta estiver configurada
  return false;
}

function buildOpportunity(place: PlaceResult, signals: { description: string }[], problems: string[]): string {
  const parts: string[] = [];
  if (signals.some((s) => s.description.includes("Anúncios"))) {
    parts.push("já investe em anúncios pagos");
  }
  if (!place.website) {
    parts.push("não possui site — potencial de criação de presença digital completa");
  }
  if (problems.length) {
    parts.push(`pontos de melhoria identificados: ${problems.slice(0, 2).join("; ")}`);
  }
  return parts.length
    ? `${place.name} ${parts.join(". ")}.`
    : `${place.name} tem presença básica no Google. Oportunidade de estruturar captação digital.`;
}

function buildMessage(place: PlaceResult, signals: { description: string }[], _problems: string[]): string {
  const hasAds = signals.some((s) => s.description.includes("Anúncios"));
  if (hasAds) {
    return `Oi! Vi que ${place.name} está com anúncios rodando — ótima iniciativa. Identifiquei alguns pontos na estrutura de captação que podem aumentar bastante a conversão sem aumentar o investimento. Faz sentido eu te mostrar o que encontrei?`;
  }
  return `Oi! Encontrei ${place.name} no Google e percebi que há uma oportunidade grande de atrair mais clientes pela internet. Muitos negócios como o seu estão captando leads todos os dias com estratégias simples. Posso te mostrar como?`;
}

function parseLocation(location: string): { city: string; state: string } {
  const parts = location.split(",").map((p) => p.trim());
  return { city: parts[0] ?? location, state: parts[1] ?? "" };
}

export async function POST(req: NextRequest) {
  const { campaignId, niche, location, keywords, maxLeads, minScore } = await req.json();

  const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!googleMapsKey) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_API_KEY não configurada. Adicione a chave no arquivo .env.local e reinicie o servidor." },
      { status: 400 }
    );
  }

  // Busca no Google Places Text Search
  const query = encodeURIComponent(`${niche} em ${location}`);
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&language=pt-BR&region=br&key=${googleMapsKey}`;

  const response = await fetch(url);
  if (!response.ok) {
    return NextResponse.json({ error: "Erro ao chamar Google Maps API" }, { status: 500 });
  }

  const gData = await response.json();

  if (gData.status && gData.status !== "OK" && gData.status !== "ZERO_RESULTS") {
    return NextResponse.json(
      { error: `Google Maps API erro: ${gData.status} — ${gData.error_message ?? "sem detalhes"}` },
      { status: 400 }
    );
  }

  const places: PlaceResult[] = (gData.results ?? []).slice(0, maxLeads ?? 20);

  const savedLeads = [];

  for (const place of places) {
    const { score, temperature, reason, signals, problems, opportunity, suggestedMessage } =
      calculateScore(place, keywords ?? []);

    if (score < (minScore ?? 0)) continue;

    const { city, state } = parseLocation(location);

    const leadPayload = {
      campaign_id: campaignId ?? null,
      name: place.name,
      niche,
      city,
      state,
      country: "Brasil",
      website: place.website ?? null,
      phone: place.formatted_phone_number ?? null,
      source: "Google Maps",
      source_url: `https://maps.google.com/?place_id=${place.place_id}`,
      score,
      temperature,
      score_reason: reason,
      opportunity,
      suggested_message: suggestedMessage,
      status: "new",
      problems_found: problems,
      terms_found: keywords ?? [],
    };

    const { data: savedLead, error: leadError } = await supabase
      .from("leads")
      .insert([leadPayload])
      .select()
      .single();

    if (leadError || !savedLead) continue;

    // Salvar sinais
    if (signals.length > 0) {
      await supabase.from("lead_signals").insert(
        signals.map((s) => ({
          lead_id: savedLead.id,
          signal_type: s.type,
          signal_description: s.description,
          points: s.points,
        }))
      );
    }

    savedLeads.push(savedLead);
  }

  // Atualizar contador da campanha
  if (campaignId) {
    await supabase
      .from("search_campaigns")
      .update({ leads_found: savedLeads.length, last_run_at: new Date().toISOString() })
      .eq("id", campaignId);
  }

  return NextResponse.json({ found: places.length, saved: savedLeads.length, leads: savedLeads });
}
