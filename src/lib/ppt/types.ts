import PptxGenJS from "pptxgenjs";
import {
  CompanyAnalysis,
  CompanyScore,
  CompanyVideoData,
  ReportPayload,
  VideoMetric
} from "@/lib/types";
import { StrategyCategory } from "@/lib/strategy";

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SlideContext {
  pptx: PptxGenJS;
  slide: PptxGenJS.Slide;
  page: number;
}

export type SlideBuilder = (ctx: SlideContext, vm: ReportViewModel) => void;

export interface CategoryRankingEntry {
  topic: StrategyCategory;
  count: number;
  coverage: number;
}

export interface ThemeCoverageEntry {
  company: string;
  topics: StrategyCategory[];
  missing: StrategyCategory[];
}

export interface TopVideoEntry {
  company: string;
  top?: VideoMetric;
  runnerUp?: VideoMetric;
  analysis?: CompanyAnalysis;
}

export interface ChannelMetricEntry {
  company: string;
  subscribers: number;
  totalVideos: number;
  uploadsPerWeek: number;
  consistency: number;
  createdAt?: string;
}

export interface NormalizedLeaders {
  subscribers?: CompanyScore;
  avgViews?: CompanyScore;
  engagementRate?: CompanyScore;
  postingFrequency?: CompanyScore;
  consistency?: CompanyScore;
  contentDiversity?: CompanyScore;
}

export interface ReportViewModel {
  report: ReportPayload;
  companies: string[];
  companyCount: number;
  requestedDate: string;
  scoresRanked: CompanyScore[];
  analysisByCompany: Map<string, CompanyAnalysis>;
  scoreByCompany: Map<string, CompanyScore>;
  normalizedLeaders: NormalizedLeaders;
  categoryRanking: CategoryRankingEntry[];
  themeCoverageByCompany: ThemeCoverageEntry[];
  channelMetrics: ChannelMetricEntry[];
  topVideoByViews: TopVideoEntry[];
  topVideoByEngagement: TopVideoEntry[];
  cardWidth: number;
  titleChars: number;
  bodyChars: number;
}
