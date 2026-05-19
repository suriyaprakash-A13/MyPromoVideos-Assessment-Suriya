import dayjs from "dayjs";
import { CompanyAnalysis, CompanyScore, CompanyVideoData, ReportPayload } from "@/lib/types";

type StrategyCategory =
  | "Educational"
  | "Product Marketing"
  | "Short-form"
  | "Customer Stories"
  | "Behind the Scenes"
  | "Entertainment"
  | "Thought Leadership"
  | "Tutorials"
  | "Case Studies"
  | "Community Content";

const STRATEGY_CATEGORIES: StrategyCategory[] = [
  "Educational",
  "Product Marketing",
  "Short-form",
  "Customer Stories",
  "Behind the Scenes",
  "Entertainment",
  "Thought Leadership",
  "Tutorials",
  "Case Studies",
  "Community Content"
];

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "your",
  "from",
  "this",
  "that",
  "how",
  "why",
  "what",
  "about",
  "our",
  "you",
  "new",
  "vs",
  "to",
  "in",
  "on",
  "of"
]);

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function average(values: number[]): number {
  if (!values.length) {
    return 0;
  }

  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length <= 1) {
    return 0;
  }

  const mean = average(values);
  const variance = average(values.map((value) => (value - mean) ** 2));
  return Math.sqrt(variance);
}

function extractTopics(titles: string[]): string[] {
  const counts = new Map<string, number>();

  for (const title of titles) {
    const words = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !STOPWORDS.has(word));

    words.forEach((word) => counts.set(word, (counts.get(word) ?? 0) + 1));
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([topic]) => topic);
}

function normalizeText(value: string): string {
  return value.toLowerCase();
}

function parseDurationSeconds(duration?: string): number | undefined {
  if (!duration) {
    return undefined;
  }

  const match = duration.match(/P(?:(\d+)D)?T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/i);
  if (!match) {
    return undefined;
  }

  const days = Number(match[1] ?? 0);
  const hours = Number(match[2] ?? 0);
  const minutes = Number(match[3] ?? 0);
  const seconds = Number(match[4] ?? 0);

  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function classifyVideo(video: CompanyVideoData["videos"][number]): StrategyCategory[] {
  const text = normalizeText([video.title, video.description ?? "", ...(video.tags ?? [])].join(" "));
  const categories = new Set<StrategyCategory>();
  const durationSeconds = parseDurationSeconds(video.duration);

  if (durationSeconds !== undefined && durationSeconds <= 60) {
    categories.add("Short-form");
  }

  if (/(shorts?|reel|clip|snippet|trailer|teaser)/i.test(text)) {
    categories.add("Short-form");
  }

  if (/(how to|guide|explainer|explained|learn|what is|intro|basics|tips|best practices)/i.test(text)) {
    categories.add("Educational");
  }

  if (/(tutorial|step by step|walkthrough|demo|setup|build|create|install|use)/i.test(text)) {
    categories.add("Tutorials");
  }

  if (/(customer|client|story|testimonial|success|case study|case studies|results|partner spotlight)/i.test(text)) {
    categories.add("Customer Stories");
    categories.add("Case Studies");
  }

  if (/(behind the scenes|bts|day in the life|making of|studio|production|office|team)/i.test(text)) {
    categories.add("Behind the Scenes");
  }

  if (/(thought leadership|future of|industry|market|trend|insight|strategy|analysis|perspective|vision)/i.test(text)) {
    categories.add("Thought Leadership");
  }

  if (/(community|event|live|qa|q&a|webinar|panel|ama|ask me anything|conference|meetup)/i.test(text)) {
    categories.add("Community Content");
  }

  if (/(launch|new feature|product update|announcement|introducing|promo|campaign|available now|buy now)/i.test(text)) {
    categories.add("Product Marketing");
  }

  if (/(funny|behind|entertainment|music|challenge|reaction|highlight|recap|story|storytime)/i.test(text)) {
    categories.add("Entertainment");
  }

  if (!categories.size) {
    categories.add("Product Marketing");
  }

  return [...categories];
}

function summarizeStrategyMix(company: CompanyVideoData): Record<StrategyCategory, number> {
  const mix = Object.fromEntries(STRATEGY_CATEGORIES.map((category) => [category, 0])) as Record<StrategyCategory, number>;

  for (const video of company.videos) {
    const categories = classifyVideo(video);
    for (const category of categories) {
      mix[category] += 1;
    }
  }

  return mix;
}

function parseVideoDate(dateText?: string): dayjs.Dayjs | undefined {
  if (!dateText) {
    return undefined;
  }

  const direct = dayjs(dateText);
  if (direct.isValid()) {
    return direct;
  }

  const relative = dateText.toLowerCase();
  const match = relative.match(/(\d+)\s+(day|week|month|year)/);

  if (!match) {
    return undefined;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  if (unit.startsWith("day")) {
    return dayjs().subtract(amount, "day");
  }
  if (unit.startsWith("week")) {
    return dayjs().subtract(amount, "week");
  }
  if (unit.startsWith("month")) {
    return dayjs().subtract(amount, "month");
  }
  return dayjs().subtract(amount, "year");
}

function inferPostingCadence(videos: CompanyVideoData["videos"]): {
  uploadsPerWeek: number;
  videosPerMonth: number;
  consistency: number;
  inactivePeriods: string[];
} {
  const dates = videos.map((video) => parseVideoDate(video.publishedAt)).filter(Boolean) as dayjs.Dayjs[];

  if (dates.length < 2) {
    const uploadsPerWeek = videos.length ? Math.max(0.25, videos.length / 4) : 0;
    return { uploadsPerWeek, videosPerMonth: uploadsPerWeek * 4.345, consistency: 0.2, inactivePeriods: [] };
  }

  const sorted = dates.sort((a, b) => a.valueOf() - b.valueOf());
  const diffs: number[] = [];
  const inactivePeriods: string[] = [];

  for (let i = 1; i < sorted.length; i += 1) {
    const gapDays = sorted[i].diff(sorted[i - 1], "day");
    diffs.push(gapDays);

    if (gapDays >= 21) {
      inactivePeriods.push(
        `${sorted[i - 1].format("YYYY-MM-DD")} to ${sorted[i].format("YYYY-MM-DD")} (${gapDays} day gap)`
      );
    }
  }

  const avgDays = average(diffs);
  const spanDays = Math.max(1, sorted[sorted.length - 1].diff(sorted[0], "day"));
  const uploadsPerWeek = sorted.length / (spanDays / 7);
  const videosPerMonth = avgDays > 0 ? 30 / avgDays : sorted.length;
  const consistency = clamp(1 - stdDev(diffs) / 30);

  return { uploadsPerWeek, videosPerMonth, consistency, inactivePeriods };
}

function summarizeCompany(data: CompanyVideoData): CompanyAnalysis {
  const views = data.videos.map((video) => video.views ?? 0).filter((value) => value > 0);
  const likes = data.videos.map((video) => video.likes ?? 0).filter((value) => value > 0);
  const comments = data.videos.map((video) => video.comments ?? 0).filter((value) => value > 0);

  const avgViews = average(views);
  const avgLikes = average(likes);
  const avgComments = average(comments);
  const engagementRate = avgViews > 0 ? ((avgLikes + avgComments) / avgViews) * 100 : 0;
  const cadence = inferPostingCadence(data.videos);

  const notes: string[] = [];
  if (avgViews > 0 && engagementRate < 1) {
    notes.push("High reach but low interaction suggests content may not invite conversation.");
  }

  if (cadence.videosPerMonth < 2) {
    notes.push("Low posting cadence may be limiting audience growth momentum.");
  }

  if (cadence.inactivePeriods.length > 0) {
    notes.push(`Detected ${cadence.inactivePeriods.length} inactive period(s) longer than 3 weeks.`);
  }

  return {
    company: data.company,
    avgViews,
    avgLikes,
    avgComments,
    engagementRate,
    uploadsPerWeek: cadence.uploadsPerWeek,
    videosPerMonth: cadence.videosPerMonth,
    consistencyScore: cadence.consistency,
    inactivePeriods: cadence.inactivePeriods,
    topTopics: extractTopics(data.videos.map((video) => video.title)),
    notes
  };
}

function normalizeMetric(values: Record<string, number>): Record<string, number> {
  const maxValue = Math.max(...Object.values(values), 0.0001);
  const normalized: Record<string, number> = {};

  Object.entries(values).forEach(([key, value]) => {
    normalized[key] = clamp(value / maxValue);
  });

  return normalized;
}

function computeScores(companies: CompanyVideoData[], analyses: CompanyAnalysis[]): CompanyScore[] {
  const byCompany = new Map(analyses.map((item) => [item.company, item]));

  const subscribersNorm = normalizeMetric(
    Object.fromEntries(companies.map((company) => [company.company, company.subscribers ?? 0]))
  );
  const viewsNorm = normalizeMetric(Object.fromEntries(analyses.map((a) => [a.company, a.avgViews])));
  const engagementNorm = normalizeMetric(Object.fromEntries(analyses.map((a) => [a.company, a.engagementRate])));
  const frequencyNorm = normalizeMetric(Object.fromEntries(analyses.map((a) => [a.company, a.videosPerMonth])));
  const consistencyNorm = normalizeMetric(Object.fromEntries(analyses.map((a) => [a.company, a.consistencyScore])));
  const diversityNorm = normalizeMetric(
    Object.fromEntries(analyses.map((a) => [a.company, new Set(a.topTopics).size]))
  );

  return companies
    .map((company) => {
      const analysis = byCompany.get(company.company);
      if (!analysis) {
        return undefined;
      }

      const normalized = {
        subscribers: subscribersNorm[company.company] ?? 0,
        avgViews: viewsNorm[company.company] ?? 0,
        engagementRate: engagementNorm[company.company] ?? 0,
        postingFrequency: frequencyNorm[company.company] ?? 0,
        consistency: consistencyNorm[company.company] ?? 0,
        contentDiversity: diversityNorm[company.company] ?? 0
      };

      const score =
        normalized.subscribers * 0.25 +
        normalized.avgViews * 0.2 +
        normalized.engagementRate * 0.2 +
        normalized.postingFrequency * 0.15 +
        normalized.consistency * 0.1 +
        normalized.contentDiversity * 0.1;

      return {
        company: company.company,
        score: Number((score * 100).toFixed(2)),
        normalized
      } satisfies CompanyScore;
    })
    .filter(Boolean)
    .sort((a, b) => b!.score - a!.score) as CompanyScore[];
}

export function buildReport(primaryCompany: string, competitors: string[], companies: CompanyVideoData[]): ReportPayload {
  const analyses = companies.map((company) => summarizeCompany(company));
  const scores = computeScores(companies, analyses);
  const leader = scores[0];

  const executiveSummary = [
    leader
      ? `${leader.company} leads overall with a score of ${leader.score}, driven by stronger audience scale and content performance.`
      : "Insufficient public data to establish a clear leader.",
    "Posting consistency and engagement efficiency are the clearest separation factors across channels.",
    "Most companies show room to improve content diversity and format experimentation."
  ];

  const strategyMixByCompany = companies.map((company) => ({
    company: company.company,
    mix: summarizeStrategyMix(company),
    uploadsPerWeek: analyses.find((analysis) => analysis.company === company.company)?.uploadsPerWeek ?? 0,
    engagementRate: analyses.find((analysis) => analysis.company === company.company)?.engagementRate ?? 0
  }));

  const categoryTotals = Object.fromEntries(STRATEGY_CATEGORIES.map((category) => [category, 0])) as Record<
    StrategyCategory,
    number
  >;
  const categoryCoverage = Object.fromEntries(STRATEGY_CATEGORIES.map((category) => [category, 0])) as Record<
    StrategyCategory,
    number
  >;

  for (const item of strategyMixByCompany) {
    for (const category of STRATEGY_CATEGORIES) {
      const count = item.mix[category];
      categoryTotals[category] += count;
      if (count > 0) {
        categoryCoverage[category] += 1;
      }
    }
  }

  const companyCount = Math.max(1, companies.length);
  const averageUploadsPerWeek = average(analyses.map((analysis) => analysis.uploadsPerWeek));
  const averageEngagementRate = average(analyses.map((analysis) => analysis.engagementRate));
  const lowCadence = averageUploadsPerWeek < 1.5;
  const weakEngagement = averageEngagementRate < 2;
  const lowVolume = averageUploadsPerWeek < 0.8;

  const insightByCategory: Array<{ category: StrategyCategory; threshold: number; insight: string }> = [
    {
      category: "Educational",
      threshold: 1,
      insight:
        "Competitors rarely publish educational or explainer-style content, creating an opportunity for authority-driven storytelling and long-term audience retention."
    },
    {
      category: "Customer Stories",
      threshold: 1,
      insight:
        "Customer success stories are largely absent across competitors, leaving room for trust-building and social proof-driven engagement."
    },
    {
      category: "Short-form",
      threshold: Math.max(1, Math.ceil(companyCount * 0.75)),
      insight:
        "Short-form video adoption appears limited across competitors, creating an opportunity to improve discoverability and rapid audience engagement."
    },
    {
      category: "Behind the Scenes",
      threshold: 1,
      insight:
        "Behind-the-scenes storytelling is underutilized, limiting opportunities for authenticity-driven audience connection."
    },
    {
      category: "Thought Leadership",
      threshold: 1,
      insight:
        "Competitors show limited investment in thought-leadership content, leaving opportunities for expertise positioning and industry authority."
    },
    {
      category: "Tutorials",
      threshold: 1,
      insight:
        "Tutorial-style content is thin across the competitive set, leaving room for practical, high-intent content that compounds search and watch-time value."
    },
    {
      category: "Case Studies",
      threshold: 1,
      insight:
        "Case-study content remains sparse, reducing opportunities to convert real-world outcomes into credibility and purchase consideration."
    },
    {
      category: "Community Content",
      threshold: 1,
      insight:
        "Community-oriented programming is underdeveloped, limiting opportunities for dialogue, loyalty, and repeat audience touchpoints."
    },
    {
      category: "Entertainment",
      threshold: 1,
      insight:
        "Entertainment-led storytelling is limited, leaving room to broaden reach with more emotionally engaging and shareable formats."
    },
    {
      category: "Product Marketing",
      threshold: 1,
      insight:
        "Competitor content leans heavily on product-centric messaging, creating space for more differentiated storytelling beyond promotion."
    }
  ];

  const gaps: string[] = [];

  for (const item of insightByCategory) {
    if (categoryCoverage[item.category] <= item.threshold - 1 || categoryTotals[item.category] === 0) {
      gaps.push(item.insight);
    }
  }

  const categoryMixCounts = strategyMixByCompany.flatMap((item) =>
    STRATEGY_CATEGORIES.filter((category) => item.mix[category] > 0).map((category) => `${item.company}:${category}`)
  );

  const uniqueCategoryCount = new Set(
    categoryMixCounts.map((entry) => entry.split(":")[1])
  ).size;

  if (lowCadence) {
    gaps.push(
      "Competitor publishing cadence lacks consistency, creating space for a more predictable and audience-retentive content strategy."
    );
  }

  if (lowVolume) {
    gaps.push(
      "Low publishing volume suggests competitors are not creating enough repeat touchpoints to build audience habit or algorithmic momentum."
    );
  }

  if (weakEngagement) {
    gaps.push(
      "Despite ongoing publishing activity, audience interaction efficiency remains weak, indicating opportunities for stronger engagement hooks and community participation."
    );
  }

  if (averageEngagementRate < 1.2) {
    gaps.push(
      "Low interaction levels point to a weak response loop, leaving room for stronger storytelling, clearer calls to action, and more comment-worthy formats."
    );
  }

  if (uniqueCategoryCount <= 2) {
    gaps.push(
      "Competitor content strategies appear heavily concentrated around limited formats, creating opportunities for differentiated multi-format storytelling."
    );
  }

  if (categoryCoverage["Educational"] < Math.max(1, Math.ceil(companyCount / 2))) {
    gaps.push(
      "Educational and explainer content is underrepresented, limiting opportunities to capture high-intent viewers and strengthen authority over time."
    );
  }

  if (categoryCoverage["Customer Stories"] === 0) {
    gaps.push(
      "Customer success stories are largely absent, leaving room to add trust-building proof points that support conversion and retention."
    );
  }

  if (categoryCoverage["Behind the Scenes"] === 0) {
    gaps.push(
      "Behind-the-scenes storytelling is missing, reducing opportunities for authenticity, brand relatability, and deeper audience connection."
    );
  }

  if (categoryCoverage["Short-form"] < Math.max(1, Math.ceil(companyCount / 2))) {
    gaps.push(
      "Short-form usage remains inconsistent across competitors, creating an opening for faster discoverability and stronger top-of-funnel reach."
    );
  }

  if (categoryCoverage["Thought Leadership"] === 0) {
    gaps.push(
      "Thought-leadership content is largely absent, leaving room to own expert positioning and drive higher-value audience perception."
    );
  }

  if (categoryCoverage["Community Content"] === 0) {
    gaps.push(
      "Community-oriented programming is missing, reducing the chance to build recurring engagement, live participation, and audience loyalty."
    );
  }

  if (!gaps.length) {
    gaps.push(
      "Competitor strategies are relatively balanced across the measured content categories, so the sharper opportunity lies in improving cadence, engagement efficiency, and multi-format execution."
    );
  }

  const dedupedGaps = [...new Set(gaps)].slice(0, 8);

  const recommendations = [
    "Build an educational pillar with explainers, tutorials, and thought-leadership videos to increase authority and search-driven discovery.",
    "Introduce customer-story and case-study content to strengthen trust, proof, and conversion intent.",
    "Increase short-form output with concise clips, highlights, and teaser content to improve reach and repeat exposure.",
    "Standardize a weekly publishing cadence so the channel compounds audience expectations and algorithmic momentum.",
    "Add behind-the-scenes and community formats to improve authenticity, loyalty, and comment-driven engagement.",
    "Create a multi-format content mix instead of overrelying on promotional uploads so the channel can broaden audience appeal and retention.",
    "Use stronger hooks, clearer calls to action, and more opinion-led framing to improve interaction efficiency and watch depth."
  ];

  return {
    requestedAt: new Date().toISOString(),
    primaryCompany,
    competitors,
    companies,
    analysis: analyses,
    scores,
    executiveSummary,
    recommendations,
    gaps: dedupedGaps,
    rankingMethod:
      "Weighted score: Subscribers 25%, Avg Views 20%, Engagement Rate 20%, Posting Frequency 15%, Consistency 10%, Content Diversity 10%. Each metric is max-normalized across analyzed companies."
  };
}
