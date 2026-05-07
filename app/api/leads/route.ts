import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const temperature = searchParams.get("temperature");
  const niche = searchParams.get("niche");
  const status = searchParams.get("status");
  const minScore = searchParams.get("minScore");
  const search = searchParams.get("search");

  let query = supabase
    .from("leads")
    .select("*, lead_signals(*)")
    .order("score", { ascending: false });

  if (temperature) query = query.eq("temperature", temperature);
  if (niche) query = query.eq("niche", niche);
  if (status) query = query.eq("status", status);
  if (minScore) query = query.gte("score", parseInt(minScore));
  if (search) query = query.ilike("name", `%${search}%`);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { data, error } = await supabase.from("leads").insert([body]).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
