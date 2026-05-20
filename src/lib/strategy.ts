import { CompanyVideoData, VideoMetric } from "@/lib/types";

export type StrategyCategory =
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

export const STRATEGY_CATEGORIES: StrategyCategory[] = [
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

export function parseDurationSeconds(duration?: string): number | undefined {
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

export function classifyVideo(video: VideoMetric): StrategyCategory[] {
  const text = [video.title, video.description ?? "", ...(video.tags ?? [])].join(" ").toLowerCase();
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

  if (/(funny|entertainment|music|challenge|reaction|highlight|recap|storytime)/i.test(text)) {
    categories.add("Entertainment");
  }

  if (!categories.size) {
    categories.add("Product Marketing");
  }

  return [...categories];
}

export function summarizeStrategyMix(company: CompanyVideoData): Record<StrategyCategory, number> {
  const mix = Object.fromEntries(STRATEGY_CATEGORIES.map((category) => [category, 0])) as Record<StrategyCategory, number>;

  for (const video of company.videos) {
    for (const category of classifyVideo(video)) {
      mix[category] += 1;
    }
  }

  return mix;
}

export function buildStrategyMix(companies: CompanyVideoData[]): {
  categoryTotals: Record<StrategyCategory, number>;
  categoryCoverage: Record<StrategyCategory, number>;
  companyMix: Array<{ company: string; mix: Record<StrategyCategory, number> }>;
} {
  const categoryTotals = Object.fromEntries(STRATEGY_CATEGORIES.map((category) => [category, 0])) as Record<
    StrategyCategory,
    number
  >;
  const categoryCoverage = Object.fromEntries(STRATEGY_CATEGORIES.map((category) => [category, 0])) as Record<
    StrategyCategory,
    number
  >;

  const companyMix = companies.map((company) => {
    const mix = summarizeStrategyMix(company);

    for (const category of STRATEGY_CATEGORIES) {
      categoryTotals[category] += mix[category];
      if (mix[category] > 0) {
        categoryCoverage[category] += 1;
      }
    }

    return { company: company.company, mix };
  });

  return { categoryTotals, categoryCoverage, companyMix };
}
