import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

interface PlaceResult {
  name: string;
  formatted_address?: string;
  formatted_phone_number?: string;
  international_phone_number?: string;
  website?: string;
  rating?: number;
  user_ratings_total?: number;
  place_id?: string;
  email?: string;
  instagram?: string;
  hasAds?: boolean;
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

// ─── Google Place Details ─────────────────────────────────────────────────────

async function getPlaceDetails(placeId: string, apiKey: string): Promise<Partial<PlaceResult>> {
  try {
    const fields = "name,formatted_phone_number,international_phone_number,website,rating,user_ratings_total";
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&language=pt-BR&key=${apiKey}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return {};
    const data = await res.json();
    return data.result ?? {};
  } catch {
    return {};
  }
}

// ─── Website enrichment ───────────────────────────────────────────────────────

async function enrichFromWebsite(websiteUrl: string): Promise<{ email?: string; instagram?: string }> {
  try {
    const res = await fetch(websiteUrl, {
      signal: AbortSignal.timeout(4000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LeadRadar/1.0)" },
    });
    if (!res.ok) return {};
    const html = await res.text();

    // Extract email
    const emailMatch = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    const email = emailMatch?.[0]?.toLowerCase();
    const skipEmails = ["sentry", "wix", "example", "email@", "noreply", "wordpress", "schema"];
    const validEmail = email && !skipEmails.some((s) => email.includes(s)) ? email : undefined;

    // Extract Instagram
    const igMatch = html.match(/instagram\.com\/([a-zA-Z0-9._]{2,30})\/?(?:["'\s]|$)/);
    const instagram = igMatch?.[1] && !["p", "reel", "stories", "explore"].includes(igMatch[1])
      ? `@${igMatch[1]}`
      : undefined;

    return { email: validEmail, instagram };
  } catch {
    return {};
  }
}

// ─── Google Custom Search for Instagram ──────────────────────────────────────

async function findInstagramViaSearch(businessName: string, location: string): Promise<string | undefined> {
  const searchKey = process.env.GOOGLE_SEARCH_API_KEY;
  const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
  if (!searchKey || !searchEngineId) return undefined;

  try {
    const query = encodeURIComponent(`site:instagram.com "${businessName}" ${location}`);
    const url = `https://www.googleapis.com/customsearch/v1?q=${query}&key=${searchKey}&cx=${searchEngineId}&num=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return undefined;
    const data = await res.json();
    const link: string = data.items?.[0]?.link ?? "";
    const match = link.match(/instagram\.com\/([a-zA-Z0-9._]{2,30})\/?$/);
    return match ? `@${match[1]}` : undefined;
  } catch {
    return undefined;
  }
}

// ─── Meta Ads Library check ───────────────────────────────────────────────────

async function checkMetaAds(businessName: string): Promise<boolean> {
  const token = process.env.FACEBOOK_ACCESS_TOKEN;
  if (!token) return false;
  try {
    const query = encodeURIComponent(businessName);
    const url = `https://graph.facebook.com/v19.0/ads_archive?access_token=${token}&ad_reached_countries=["BR"]&search_terms=${query}&ad_type=ALL&fields=id,page_name&limit=1`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return false;
    const data = await res.json();
    return (data.data?.length ?? 0) > 0;
  } catch {
    return false;
  }
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function calculateScore(place: PlaceResult, keywords: string[]): ScoreResult {
  let score = 0;
  const signals: { type: string; description: string; points: number }[] = [];
  const problems: string[] = [];

  if (place.website) {
    score += 5;
    signals.push({ type: "website", description: "Possui site", points: 5 });
    if (place.website.includes("facebook.com")) {
      problems.push("Usa Facebook como site — sem domínio próprio");
      score += 8;
    }
  } else {
    problems.push("Sem site — oportunidade de presença digital");
    score += 10;
  }

  if (place.formatted_phone_number || place.international_phone_number) {
    score += 5;
    signals.push({ type: "phone", description: "Telefone público disponível", points: 5 });
  }

  if (place.email) {
    score += 10;
    signals.push({ type: "email", description: `E-mail encontrado: ${place.email}`, points: 10 });
  }

  if (place.instagram) {
    score += 8;
    signals.push({ type: "instagram", description: `Instagram encontrado: ${place.instagram}`, points: 8 });
  }

  if (place.rating && place.user_ratings_total) {
    if (place.rating >= 4.5 && place.user_ratings_total >= 20) {
      score += 15;
      signals.push({ type: "rating", description: `Avaliação excelente (${place.rating}★, ${place.user_ratings_total} avaliações)`, points: 15 });
    } else if (place.rating >= 4.0) {
      score += 8;
      signals.push({ type: "rating", description: `Boa avaliação (${place.rating}★)`, points: 8 });
    } else if (place.rating < 3.5 && place.user_ratings_total >= 10) {
      problems.push("Avaliação baixa no Google — oportunidade de gestão de reputação");
      score += 12;
    }
  }

  if (place.hasAds) {
    score += 20;
    signals.push({ type: "advertising", description: "Anúncios ativos no Meta Ads Library", points: 20 });
  }

  const foundKeywords = keywords.filter((kw) =>
    place.name.toLowerCase().includes(kw.toLowerCase()) ||
    (place.formatted_address ?? "").toLowerCase().includes(kw.toLowerCase())
  );
  if (foundKeywords.length > 0) {
    const pts = Math.min(foundKeywords.length * 5, 15);
    score += pts;
    signals.push({ type: "keywords", description: `Palavras-chave encontradas: ${foundKeywords.join(", ")}`, points: pts });
  }

  score = Math.min(score, 100);
  const temperature: "hot" | "warm" | "cold" = score >= 70 ? "hot" : score >= 40 ? "warm" : "cold";

  const reasonParts = signals.map((s) => `${s.description} (+${s.points})`);
  if (problems.length) reasonParts.push(...problems.map((p) => `${p} (+bônus)`));
  const reason = reasonParts.join(". ") || "Score baseado em dados básicos do Google Maps.";

  const opportunity = buildOpportunity(place, signals, problems);
  const suggestedMessage = buildMessage(place, signals, problems);

  return { score, temperature, reason, signals, problems, opportunity, suggestedMessage };
}

function buildOpportunity(place: PlaceResult, signals: { description: string }[], problems: string[]): string {
  const parts: string[] = [];
  if (place.hasAds) parts.push("já investe em anúncios pagos");
  if (!place.website) parts.push("não possui site — potencial de criação de presença digital completa");
  if (problems.length) parts.push(`pontos de melhoria: ${problems.slice(0, 2).join("; ")}`);
  return parts.length
    ? `${place.name} ${parts.join(". ")}.`
    : `${place.name} tem presença básica no Google. Oportunidade de estruturar captação digital.`;
}

function buildMessage(place: PlaceResult, signals: { description: string }[], _problems: string[]): string {
  if (place.hasAds) {
    return `Oi! Vi que ${place.name} está com anúncios rodando — ótima iniciativa. Identifiquei pontos na estrutura de captação que podem aumentar bastante a conversão sem aumentar o investimento. Faz sentido eu te mostrar?`;
  }
  if (!place.website) {
    return `Oi! Encontrei ${place.name} no Google e vi que vocês ainda não têm site. Hoje em dia isso representa uma perda real de clientes todo dia. Posso te mostrar como resolver isso de forma simples e barata?`;
  }
  return `Oi! Encontrei ${place.name} e percebi que há uma oportunidade de atrair mais clientes pela internet. Muitos negócios como o seu estão captando leads todos os dias com estratégias simples. Posso te mostrar como?`;
}

function parseLocation(location: string): { city: string; state: string } {
  const parts = location.split(",").map((p) => p.trim());
  return { city: parts[0] ?? location, state: parts[1] ?? "" };
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const { campaignId, niche, location, keywords, maxLeads, minScore } = await req.json();

  const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!googleMapsKey) {
    return NextResponse.json(
      { error: "GOOGLE_MAPS_API_KEY não configurada." },
      { status: 400 }
    );
  }

  // 1. Text Search
  const query = encodeURIComponent(`${niche} em ${location}`);
  const textUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&language=pt-BR&region=br&key=${googleMapsKey}`;

  const textRes = await fetch(textUrl);
  if (!textRes.ok) {
    return NextResponse.json({ error: "Erro ao chamar Google Maps API" }, { status: 500 });
  }

  const gData = await textRes.json();

  if (gData.status && gData.status !== "OK" && gData.status !== "ZERO_RESULTS") {
    return NextResponse.json(
      { error: `Google Maps API erro: ${gData.status} — ${gData.error_message ?? "sem detalhes"}` },
      { status: 400 }
    );
  }

  const rawPlaces = (gData.results ?? []).slice(0, maxLeads ?? 20);

  // 2. Enrich each place in parallel (Place Details + website + Instagram + Meta Ads)
  const enriched: PlaceResult[] = await Promise.all(
    rawPlaces.map(async (place: PlaceResult) => {
      const [details, metaAds] = await Promise.all([
        place.place_id ? getPlaceDetails(place.place_id, googleMapsKey) : {},
        checkMetaAds(place.name),
      ]);

      const merged: PlaceResult = { ...place, ...details, hasAds: metaAds };

      // Enrich from website
      if (merged.website) {
        const web = await enrichFromWebsite(merged.website);
        if (web.email) merged.email = web.email;
        if (web.instagram) merged.instagram = web.instagram;
      }

      // Try Instagram via Google Custom Search if not found yet
      if (!merged.instagram) {
        const ig = await findInstagramViaSearch(place.name, location);
        if (ig) merged.instagram = ig;
      }

      return merged;
    })
  );

  // 3. Score and save
  const savedLeads = [];
  const { city, state } = parseLocation(location);

  for (const place of enriched) {
    const { score, temperature, reason, signals, problems, opportunity, suggestedMessage } =
      calculateScore(place, keywords ?? []);

    if (score < (minScore ?? 0)) continue;

    const leadPayload = {
      campaign_id: campaignId ?? null,
      name: place.name,
      niche,
      city,
      state,
      country: "Brasil",
      website: place.website ?? null,
      phone: place.formatted_phone_number ?? place.international_phone_number ?? null,
      email: place.email ?? null,
      instagram: place.instagram ?? null,
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

  if (campaignId) {
    await supabase
      .from("search_campaigns")
      .update({ leads_found: savedLeads.length, last_run_at: new Date().toISOString() })
      .eq("id", campaignId);
  }

  return NextResponse.json({
    found: rawPlaces.length,
    saved: savedLeads.length,
    leads: savedLeads,
  });
}
