export type MatchConfidence = "high" | "medium" | "low";

export interface SearchCandidate {
  title: string;
  url: string;
  snippet: string;
}

export interface CompanyDiscovery {
  company: string;
  channelId?: string;
  channelUrl?: string;
  channelTitle?: string;
  channelThumbnailUrl?: string;
  confidence: MatchConfidence;
  confidenceReason: string;
  candidates: SearchCandidate[];
}

export interface VideoMetric {
  title: string;
  url: string;
  description?: string;
  publishedAt?: string;
  views?: number;
  likes?: number;
  comments?: number;
  duration?: string;
  tags?: string[];
}

export interface CompanyVideoData {
  company: string;
  discovery: CompanyDiscovery;
  channelDescription?: string;
  channelViews?: number;
  channelCreatedAt?: string;
  channelThumbnailUrl?: string;
  subscribers?: number;
  totalVideos?: number;
  videos: VideoMetric[];
  dataQuality: "full" | "partial" | "limited";
  notes: string[];
}

export type TrendDirection = "up" | "down" | "flat";

export interface MetricVelocity {
  recent: number;
  previous: number;
  changePct: number;
  direction: TrendDirection;
}

export interface CompanyVelocityEntry {
  company: string;
  windowLabel: string;
  recentCount: number;
  previousCount: number;
  avgViews: MetricVelocity;
  engagementRate: MetricVelocity;
  uploadsPerWeek: MetricVelocity;
  scoreTrend: MetricVelocity;
}

export interface TrendVelocityReport {
  headline: string;
  windowDescription: string;
  improvingCount: number;
  decliningCount: number;
  companies: CompanyVelocityEntry[];
}

export interface ScoreTrend {
  direction: TrendDirection;
  changePct: number;
  recentScore: number;
  previousScore: number;
}

export interface CompanyScore {
  company: string;
  score: number;
  trend?: ScoreTrend;
  normalized: {
    subscribers: number;
    avgViews: number;
    engagementRate: number;
    postingFrequency: number;
    consistency: number;
    contentDiversity: number;
  };
}

export interface CompanyAnalysis {
  company: string;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  uploadsPerWeek: number;
  videosPerMonth: number;
  consistencyScore: number;
  inactivePeriods: string[];
  topTopics: string[];
  notes: string[];
}

export interface BestTimeToPostInsight {
  headline: string;
  bestDayRange: string;
  bestHourRange: string | null;
  engagementMultiplier: number;
  sampleSize: number;
  confidence: "low" | "medium" | "high";
  details: string[];
}

export interface ReportPayload {
  requestedAt: string;
  primaryCompany: string;
  competitors: string[];
  companies: CompanyVideoData[];
  analysis: CompanyAnalysis[];
  scores: CompanyScore[];
  executiveSummary: string[];
  recommendations: string[];
  gaps: string[];
  rankingMethod: string;
  bestTimeToPost?: BestTimeToPostInsight;
  trendVelocity?: TrendVelocityReport;
}
