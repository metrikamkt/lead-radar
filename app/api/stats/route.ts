import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data: leads, error } = await supabase
    .from("leads")
    .select("score, temperature, niche, created_at");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const all = leads ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  const nicheCounts: Record<string, number> = {};
  for (const l of all) {
    if (l.niche) nicheCounts[l.niche] = (nicheCounts[l.niche] ?? 0) + 1;
  }
  const topNiche = Object.entries(nicheCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  const { data: lastCampaign } = await supabase
    .from("search_campaigns")
    .select("last_run_at")
    .order("last_run_at", { ascending: false })
    .limit(1)
    .single();

  return NextResponse.json({
    totalLeads: all.length,
    hotLeads: all.filter((l) => l.temperature === "hot").length,
    warmLeads: all.filter((l) => l.temperature === "warm").length,
    coldLeads: all.filter((l) => l.temperature === "cold").length,
    avgScore: all.length ? Math.round(all.reduce((s, l) => s + l.score, 0) / all.length) : 0,
    topNiche,
    newLeadsToday: all.filter((l) => l.created_at?.slice(0, 10) === today).length,
    newLeadsWeek: all.filter((l) => l.created_at >= weekAgo).length,
    lastSearchAt: lastCampaign?.last_run_at ?? null,
  });
}
