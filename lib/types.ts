export type LeadTemperature = "hot" | "warm" | "cold";
export type LeadStatus = "new" | "contacted" | "qualified" | "proposal" | "closed_won" | "closed_lost" | "archived";
export type SearchFrequency = "manual" | "daily" | "weekly" | "monthly";
export type ExportFormat = "csv" | "excel" | "google_sheets" | "notion" | "hubspot" | "pipedrive" | "rd_station" | "webhook";

export interface LeadSignal {
  id: string;
  leadId: string;
  signalType: string;
  signalDescription: string;
  points: number;
  sourceUrl?: string;
  createdAt: string;
}

export interface Lead {
  id: string;
  campaignId?: string;
  campaign_id?: string;
  name: string;
  niche: string;
  subniche?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  email?: string;
  phone?: string;
  city: string;
  state: string;
  country?: string;
  responsible?: string;
  source: string;
  sourceUrl?: string;
  source_url?: string;
  score: number;
  temperature: LeadTemperature;
  scoreReason?: string;
  score_reason?: string;
  opportunity?: string;
  suggestedMessage?: string;
  suggested_message?: string;
  status: LeadStatus;
  signals?: LeadSignal[];
  lead_signals?: LeadSignal[];
  observations?: string;
  termsFound?: string[];
  terms_found?: string[];
  problemsFound?: string[];
  problems_found?: string[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface SearchCampaign {
  id: string;
  userId: string;
  name: string;
  niche: string;
  keywords: string[];
  location: string;
  frequency: SearchFrequency;
  status: "active" | "paused" | "completed";
  sources: string[];
  minScore: number;
  maxLeads: number;
  intentSignals: string[];
  leadsFound: number;
  createdAt: string;
  lastRunAt?: string;
}

export interface NicheSummary {
  niche: string;
  totalLeads: number;
  avgScore: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  topSignals: string[];
  topPains: string[];
  bestApproach: string;
}

export interface DashboardStats {
  totalLeads: number;
  hotLeads: number;
  warmLeads: number;
  coldLeads: number;
  topNiche: string;
  avgScore: number;
  lastSearchAt?: string;
  newLeadsToday: number;
  newLeadsWeek: number;
}

export interface ScoreBreakdown {
  category: string;
  description: string;
  points: number;
  maxPoints: number;
}
