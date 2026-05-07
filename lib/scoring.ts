import { Lead, LeadTemperature, ScoreBreakdown } from "./types";

export function calculateTemperature(score: number): LeadTemperature {
  if (score >= 70) return "hot";
  if (score >= 40) return "warm";
  return "cold";
}

export function generateScoreBreakdown(lead: Partial<Lead>): ScoreBreakdown[] {
  const breakdown: ScoreBreakdown[] = [];

  // Basic data
  if (lead.website) breakdown.push({ category: "Dados básicos", description: "Possui site", points: 5, maxPoints: 5 });
  if (lead.instagram) breakdown.push({ category: "Dados básicos", description: "Instagram ativo", points: 5, maxPoints: 5 });
  if (lead.email) breakdown.push({ category: "Dados básicos", description: "E-mail comercial público", points: 5, maxPoints: 5 });
  if (lead.phone) breakdown.push({ category: "Dados básicos", description: "WhatsApp comercial público", points: 5, maxPoints: 5 });

  return breakdown;
}

export function getTemperatureLabel(temp: LeadTemperature): string {
  const labels = { hot: "Quente", warm: "Morno", cold: "Frio" };
  return labels[temp];
}

export function getTemperatureColor(temp: LeadTemperature): string {
  const colors = {
    hot: "text-red-500 bg-red-50 border-red-200",
    warm: "text-orange-500 bg-orange-50 border-orange-200",
    cold: "text-blue-500 bg-blue-50 border-blue-200",
  };
  return colors[temp];
}

export function getScoreColor(score: number): string {
  if (score >= 70) return "text-red-500";
  if (score >= 40) return "text-orange-500";
  return "text-blue-500";
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    new: "Novo",
    contacted: "Contatado",
    qualified: "Qualificado",
    proposal: "Proposta",
    closed_won: "Fechado",
    closed_lost: "Perdido",
    archived: "Arquivado",
  };
  return labels[status] || status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "bg-slate-100 text-slate-700",
    contacted: "bg-blue-100 text-blue-700",
    qualified: "bg-purple-100 text-purple-700",
    proposal: "bg-yellow-100 text-yellow-700",
    closed_won: "bg-green-100 text-green-700",
    closed_lost: "bg-red-100 text-red-700",
    archived: "bg-gray-100 text-gray-500",
  };
  return colors[status] || "bg-gray-100 text-gray-700";
}
