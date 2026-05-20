import { CompanyScore, CompanyVideoData, ReportPayload, VideoMetric } from "@/lib/types";
import { STRATEGY_CATEGORIES, buildStrategyMix } from "@/lib/strategy";
import { columnWidth } from "@/lib/ppt/layout";
import { maxCharsForWidth, videoEngagement } from "@/lib/ppt/format";
import {
  ReportViewModel,
  NormalizedLeaders,
  CategoryRankingEntry,
  ThemeCoverageEntry,
  TopVideoEntry,
  ChannelMetricEntry
} from "@/lib/ppt/types";
import { CONTENT_W } from "@/lib/ppt/layout";

function getTopMetricLeader(scores: CompanyScore[], metric: keyof CompanyScore["normalized"]): CompanyScore | undefined {
  return [...scores].sort((left, right) => right.normalized[metric] - left.normalized[metric])[0];
}

function sortVideosByViews(company: CompanyVideoData): VideoMetric[] {
  return [...company.videos].sort((left, right) => (right.views ?? 0) - (left.views ?? 0));
}

function sortVideosByEngagement(company: CompanyVideoData): VideoMetric[] {
  return [...company.videos].sort((left, right) => videoEngagement(right) - videoEngagement(left));
}

export function buildReportViewModel(report: ReportPayload): ReportViewModel {
  const companies = report.companies.map((company) => company.company);
  const companyCount = Math.max(1, companies.length);
  const analysisByCompany = new Map(report.analysis.map((analysis) => [analysis.company, analysis]));
  const scoreByCompany = new Map(report.scores.map((score) => [score.company, score]));

  const { categoryTotals, categoryCoverage, companyMix } = buildStrategyMix(report.companies);
  const categoryRanking: CategoryRankingEntry[] = STRATEGY_CATEGORIES.map((category) => ({
    topic: category,
    count: categoryTotals[category],
    coverage: categoryCoverage[category]
  })).sort((left, right) => right.count - left.count);

  const scoresRanked = [...report.scores].sort((left, right) => right.score - left.score);

  const normalizedLeaders: NormalizedLeaders = {
    subscribers: getTopMetricLeader(report.scores, "subscribers"),
    avgViews: getTopMetricLeader(report.scores, "avgViews"),
    engagementRate: getTopMetricLeader(report.scores, "engagementRate"),
    postingFrequency: getTopMetricLeader(report.scores, "postingFrequency"),
    consistency: getTopMetricLeader(report.scores, "consistency"),
    contentDiversity: getTopMetricLeader(report.scores, "contentDiversity")
  };

  const channelMetrics: ChannelMetricEntry[] = report.companies.map((company) => {
    const analysis = analysisByCompany.get(company.company);
    return {
      company: company.company,
      subscribers: company.subscribers ?? 0,
      totalVideos: company.totalVideos ?? company.videos.length,
      uploadsPerWeek: analysis?.uploadsPerWeek ?? 0,
      consistency: analysis?.consistencyScore ?? 0,
      createdAt: company.channelCreatedAt
    };
  });

  const topVideoByViews: TopVideoEntry[] = report.companies.map((company) => {
    const videos = sortVideosByViews(company);
    return {
      company: company.company,
      top: videos[0],
      runnerUp: videos[1],
      analysis: analysisByCompany.get(company.company)
    };
  });

  const topVideoByEngagement: TopVideoEntry[] = report.companies.map((company) => {
    const videos = sortVideosByEngagement(company);
    return {
      company: company.company,
      top: videos[0],
      analysis: analysisByCompany.get(company.company)
    };
  });

  const themeCoverageByCompany: ThemeCoverageEntry[] = companyMix.map((item) => {
    const topics = STRATEGY_CATEGORIES.filter((category) => item.mix[category] > 0)
      .sort((left, right) => item.mix[right] - item.mix[left])
      .slice(0, 4);
    const missing = categoryRanking
      .map((entry) => entry.topic)
      .filter((topic) => !topics.includes(topic))
      .slice(0, 3);
    return {
      company: item.company,
      topics,
      missing
    };
  });

  const cardWidth = columnWidth(companyCount);
  const titleChars = maxCharsForWidth(cardWidth, cardWidth > 2.6 ? 12 : 10);
  const bodyChars = maxCharsForWidth(cardWidth, 9);

  return {
    report,
    companies,
    companyCount,
    requestedDate: new Date(report.requestedAt).toLocaleDateString(),
    scoresRanked,
    analysisByCompany,
    scoreByCompany,
    normalizedLeaders,
    categoryRanking,
    themeCoverageByCompany,
    channelMetrics,
    topVideoByViews,
    topVideoByEngagement,
    cardWidth,
    titleChars,
    bodyChars
  };
}
