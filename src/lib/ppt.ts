import PptxGenJS from "pptxgenjs";
import { CompanyAnalysis, CompanyScore, CompanyVideoData, ReportPayload, VideoMetric } from "@/lib/types";

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

const COLORS = {
  bg: "0B1020",
  bg2: "10192E",
  panel: "15203A",
  panel2: "1A2744",
  panel3: "223155",
  line: "344466",
  text: "F8FAFC",
  muted: "A7B4D1",
  purple: "8B5CF6",
  violet: "C084FC",
  cyan: "22D3EE",
  gold: "FBBF24",
  green: "34D399",
  red: "F87171",
  white: "FFFFFF"
};

const SLIDE_W = 13.333;
const SLIDE_H = 7.5;

function fmtNumber(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en").format(Math.round(value));
}

function fmtCompact(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

function fmtPct(value?: number, digits = 1): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return `${value.toFixed(digits)}%`;
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

function videoEngagement(video: VideoMetric): number {
  if (!video.views || video.views <= 0) {
    return 0;
  }

  return (((video.likes ?? 0) + (video.comments ?? 0)) / video.views) * 100;
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

function classifyVideo(video: VideoMetric): StrategyCategory[] {
  const text = [video.title, video.description ?? "", ...(video.tags ?? [])].join(" ").toLowerCase();
  const categories = new Set<StrategyCategory>();
  const durationSeconds = parseDurationSeconds(video.duration);

  if (durationSeconds !== undefined && durationSeconds <= 60) {
    categories.add("Short-form");
  }
  if (/(shorts?|clip|trailer|teaser|reel)/i.test(text)) {
    categories.add("Short-form");
  }
  if (/(how to|guide|explainer|explained|learn|what is|basics|tips|best practices)/i.test(text)) {
    categories.add("Educational");
  }
  if (/(tutorial|walkthrough|step by step|demo|setup|build|create|install|use)/i.test(text)) {
    categories.add("Tutorials");
  }
  if (/(customer|client|testimonial|success|case study|case studies|results|spotlight)/i.test(text)) {
    categories.add("Customer Stories");
    categories.add("Case Studies");
  }
  if (/(behind the scenes|bts|making of|day in the life|studio|production|team)/i.test(text)) {
    categories.add("Behind the Scenes");
  }
  if (/(thought leadership|future of|industry|trend|insight|strategy|analysis|vision)/i.test(text)) {
    categories.add("Thought Leadership");
  }
  if (/(community|event|live|qa|q&a|webinar|panel|ama|meetup)/i.test(text)) {
    categories.add("Community Content");
  }
  if (/(launch|new feature|product update|announcement|introducing|promo|campaign|available now)/i.test(text)) {
    categories.add("Product Marketing");
  }
  if (/(funny|entertainment|challenge|reaction|highlight|recap|storytime)/i.test(text)) {
    categories.add("Entertainment");
  }

  if (!categories.size) {
    categories.add("Product Marketing");
  }

  return [...categories];
}

function buildStrategyMix(companies: CompanyVideoData[]): {
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
    const mix = Object.fromEntries(STRATEGY_CATEGORIES.map((category) => [category, 0])) as Record<
      StrategyCategory,
      number
    >;

    for (const video of company.videos) {
      for (const category of classifyVideo(video)) {
        mix[category] += 1;
      }
    }

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

function sortVideosByViews(company: CompanyVideoData): VideoMetric[] {
  return [...company.videos].sort((left, right) => (right.views ?? 0) - (left.views ?? 0));
}

function sortVideosByEngagement(company: CompanyVideoData): VideoMetric[] {
  return [...company.videos].sort((left, right) => videoEngagement(right) - videoEngagement(left));
}

function getTopMetricLeader(scores: CompanyScore[], metric: keyof CompanyScore["normalized"]): CompanyScore | undefined {
  return [...scores].sort((left, right) => right.normalized[metric] - left.normalized[metric])[0];
}

function addCard(
  slide: PptxGenJS.Slide,
  x: number,
  y: number,
  w: number,
  h: number,
  accent: string,
  title: string,
  body: string,
  titleSize = 13,
  bodySize = 10.5
): void {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 }
  });

  // Add left accent bar
  slide.addShape("roundRect", {
    x: x,
    y: y,
    w: 0.08,
    h: h,
    fill: { color: accent },
    rectRadius: 0
  });

  slide.addText(title, {
    x: x + 0.24,
    y: y + 0.1,
    w: w - 0.34,
    h: 0.35,
    fontFace: "Aptos Display",
    fontSize: titleSize,
    color: COLORS.white,
    bold: true,
    valign: "middle",
    margin: 0,
    fit: "shrink",
    ...( { animate: { type: "fade", speed: "fast" } } as any )
  });

  slide.addText(body, {
    x: x + 0.24,
    y: y + 0.5,
    w: w - 0.34,
    h: h - 0.55,
    fontFace: "Aptos",
    fontSize: bodySize,
    color: COLORS.muted,
    margin: [2, 0, 2, 0],
    valign: "top",
    lineSpacing: 16,
    fit: "shrink",
    ...( { animate: { type: "fade", speed: "fast", delay: 0.5 } } as any )
  });
}

function addMetricCard(
  slide: PptxGenJS.Slide,
  x: number,
  y: number,
  w: number,
  h: number,
  label: string,
  value: string,
  detail: string,
  accent: string
): void {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.panel2 },
    line: { color: COLORS.line, pt: 1 }
  });

  // Add left accent bar
  slide.addShape("roundRect", {
    x: x,
    y: y,
    w: 0.08,
    h: h,
    fill: { color: accent },
    rectRadius: 0
  });

  slide.addText(label, {
    x: x + 0.2,
    y: y + 0.1,
    w: w - 0.3,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: COLORS.muted,
    valign: "middle",
    margin: 0,
    ...( { animate: { type: "fade", speed: "fast" } } as any )
  });

  slide.addText(value, {
    x: x + 0.2,
    y: y + 0.35,
    w: w - 0.3,
    h: 0.35,
    fontFace: "Aptos Display",
    fontSize: 22,
    bold: true,
    color: COLORS.white,
    valign: "middle",
    margin: 0,
    fit: "shrink",
    ...( { animate: { type: "fade", speed: "fast", delay: 0.5 } } as any )
  });

  slide.addText(detail, {
    x: x + 0.2,
    y: y + 0.65,
    w: w - 0.3,
    h: h - 0.7,
    fontFace: "Aptos",
    fontSize: 9.5,
    color: COLORS.muted,
    valign: "top",
    lineSpacing: 14,
    margin: [2, 0, 0, 0],
    fit: "shrink",
    ...( { animate: { type: "fade", speed: "fast", delay: 1.0 } } as any )
  });
}

function addPill(slide: PptxGenJS.Slide, x: number, y: number, label: string, fill: string, textColor = COLORS.white): number {
  const width = Math.max(0.95, Math.min(2.6, label.length * 0.095 + 0.42));
  slide.addShape("roundRect", {
    x,
    y,
    w: width,
    h: 0.32,
    fill: { color: fill },
    line: { color: fill, pt: 0.8 }
  });

  slide.addText(label, {
    x,
    y: y + 0.03,
    w: width,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 7.8,
    bold: true,
    color: textColor,
    align: "center",
    margin: 0,
    fit: "shrink"
  });

  return width;
}

function addHeader(slide: PptxGenJS.Slide, title: string, subtitle: string, pageNumber: number, totalPages: number): void {
  slide.background = { color: COLORS.bg };
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: 0.16,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.bg2, pt: 0 }
  });
  slide.addShape("rect", {
    x: 0,
    y: 0.16,
    w: SLIDE_W,
    h: 0.16,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.bg2, pt: 0 }
  });

  // removed purple header strip per user request

  slide.addText(title, {
    x: 0.72,
    y: 0.34,
    w: 11.3,
    h: 0.34,
    fontFace: "Aptos Display",
    fontSize: 22,
    bold: true,
    color: COLORS.white,
    margin: 0,
    fit: "shrink"
  });

  slide.addText(subtitle, {
    x: 0.74,
    y: 0.7,
    w: 11.7,
    h: 0.26,
    fontFace: "Aptos",
    fontSize: 9.5,
    color: COLORS.muted,
    margin: 0,
    fit: "shrink"
  });

  slide.addShape("line", {
    x: 0.72,
    y: 1.05,
    w: 11.95,
    h: 0,
    line: { color: COLORS.line, pt: 1 }
  });

  slide.addText(`Page ${pageNumber} / ${totalPages}`, {
    x: 12.1,
    y: 7.02,
    w: 0.9,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 7.8,
    color: COLORS.muted,
    align: "right",
    margin: 0
  });

  slide.addText("Mypromovdos video intelligence", {
    x: 0.72,
    y: 7.02,
    w: 3.5,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 7.8,
    color: COLORS.muted,
    margin: 0
  });
}

function addCoverHeader(slide: PptxGenJS.Slide): void {
  slide.background = { color: COLORS.bg };
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: SLIDE_H,
    fill: { color: COLORS.bg },
    line: { color: COLORS.bg, pt: 0 }
  });
  slide.addShape("rect", {
    x: 0,
    y: 0,
    w: SLIDE_W,
    h: 0.22,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.bg2, pt: 0 }
  });
  slide.addShape("rect", {
    x: 0,
    y: 0.22,
    w: SLIDE_W,
    h: 0.2,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.bg2, pt: 0 }
  });
}

function addSectionCallout(slide: PptxGenJS.Slide, x: number, y: number, w: number, h: number, title: string, body: string, accent: string): void {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 }
  });

  slide.addShape("roundRect", {
    x: x,
    y: y,
    w: 0.08,
    h: h,
    fill: { color: accent },
    rectRadius: 0
  });

  slide.addText(title, {
    x: x + 0.22,
    y: y + 0.15,
    w: w - 0.32,
    h: 0.3,
    fontFace: "Aptos Display",
    fontSize: 14,
    bold: true,
    valign: "middle",
    color: COLORS.white,
    margin: 0,
    fit: "shrink",
    ...( { animate: { type: "fade", speed: "fast" } } as any )
  });

  slide.addText(body, {
    x: x + 0.22,
    y: y + 0.5,
    w: w - 0.38,
    h: h - 0.55,
    fontFace: "Aptos",
    fontSize: 11,
    color: COLORS.muted,
    margin: [2, 0, 2, 0],
    valign: "top",
    lineSpacing: 17,
    fit: "shrink",
    ...( { animate: { type: "fade", speed: "fast", delay: 0.5 } } as any )
  });
}

export async function generatePpt(report: ReportPayload): Promise<Buffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "Mypromovdos Analyzer";
  pptx.company = report.primaryCompany;
  pptx.subject = "Video marketing benchmark report";
  pptx.title = `Video Strategy Benchmark - ${report.primaryCompany}`;

  const companies = report.companies.map((company) => company.company);
  const companyCount = Math.max(1, companies.length);
  const requestedDate = new Date(report.requestedAt).toLocaleDateString();
  const topScore = report.scores[0];
  const analysisByCompany = new Map(report.analysis.map((analysis) => [analysis.company, analysis]));
  const scoreByCompany = new Map(report.scores.map((score) => [score.company, score]));

  const { categoryTotals, categoryCoverage, companyMix } = buildStrategyMix(report.companies);
  const categoryRanking = STRATEGY_CATEGORIES.map((category) => ({
    topic: category,
    count: categoryTotals[category],
    coverage: categoryCoverage[category]
  })).sort((left, right) => right.count - left.count);

  const scoresRanked = [...report.scores].sort((left, right) => right.score - left.score);
  const normalizedLeaders = {
    subscribers: getTopMetricLeader(report.scores, "subscribers"),
    avgViews: getTopMetricLeader(report.scores, "avgViews"),
    engagementRate: getTopMetricLeader(report.scores, "engagementRate"),
    postingFrequency: getTopMetricLeader(report.scores, "postingFrequency"),
    consistency: getTopMetricLeader(report.scores, "consistency"),
    contentDiversity: getTopMetricLeader(report.scores, "contentDiversity")
  };

  const channelMetrics = report.companies.map((company) => {
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

  const topVideoByViews = report.companies.map((company) => {
    const videos = sortVideosByViews(company);
    const top = videos[0];
    const runnerUp = videos[1];
    return {
      company: company.company,
      top,
      runnerUp,
      analysis: analysisByCompany.get(company.company)
    };
  });

  const topVideoByEngagement = report.companies.map((company) => {
    const videos = sortVideosByEngagement(company);
    const top = videos[0];
    return {
      company: company.company,
      top,
      analysis: analysisByCompany.get(company.company)
    };
  });

  const themeCoverageByCompany = companyMix.map((item) => {
    const topics = STRATEGY_CATEGORIES.filter((category) => item.mix[category] > 0)
      .sort((left, right) => item.mix[right] - item.mix[left])
      .slice(0, 4);
    const missing = categoryRanking.map((entry) => entry.topic).filter((topic) => !topics.includes(topic)).slice(0, 3);
    return {
      company: item.company,
      topics,
      missing
    };
  });

  const cover = pptx.addSlide();
  addCoverHeader(cover);

  cover.addShape("roundRect", {
    x: 0.78,
    y: 0.95,
    w: 7.6,
    h: 5.55,
    fill: { color: COLORS.bg2 },
    line: { color: COLORS.line, pt: 1 }
  });
  cover.addShape("roundRect", {
    x: 8.67,
    y: 0.95,
    w: 3.95,
    h: 5.55,
    fill: { color: COLORS.panel },
    line: { color: COLORS.line, pt: 1 }
  });

  cover.addText("Video Marketing Intelligence Report", {
    x: 1.08,
    y: 1.28,
    w: 6.9,
    h: 0.92,
    fontFace: "Aptos Display",
    fontSize: 33,
    bold: true,
    color: COLORS.white,
    margin: 0,
    fit: "shrink"
  });

  cover.addText(`${companies.join(" vs ")}`, {
    x: 1.1,
    y: 2.25,
    w: 6.9,
    h: 0.38,
    fontFace: "Aptos",
    fontSize: 15.5,
    color: "DCE7FF",
    margin: 0,
    fit: "shrink"
  });

  cover.addText(`Prepared from publicly available video and channel data`, {
    x: 1.1,
    y: 2.64,
    w: 6.9,
    h: 0.24,
    fontFace: "Aptos",
    fontSize: 9.5,
    color: COLORS.muted,
    margin: 0
  });

  cover.addText(`Report date: ${requestedDate}`, {
    x: 1.1,
    y: 3.03,
    w: 4,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 9.8,
    color: COLORS.cyan,
    margin: 0
  });

  addPill(cover, 1.1, 3.42, "Public data only", COLORS.panel3);
  addPill(cover, 2.63, 3.42, "Insight-led slides", COLORS.panel3);
  addPill(cover, 4.35, 3.42, "Client-ready export", COLORS.panel3);

  addMetricCard(cover, 9.0, 1.25, 3.05, 0.88, "Companies analyzed", `${companies.length}`, "Primary brand plus competitors", COLORS.purple);
  addMetricCard(cover, 9.0, 2.26, 3.05, 0.88, "Lead company", topScore?.company ?? "n/a", `Top weighted score: ${topScore ? topScore.score.toFixed(1) : "n/a"}`, COLORS.cyan);
  addMetricCard(cover, 9.0, 3.27, 3.05, 0.88, "Slide sections", "12", "Executive, charts, gaps, ranking, methodology", COLORS.gold);
  addMetricCard(cover, 9.0, 4.28, 3.05, 0.88, "Output format", "PPTX", "Professional layout and speaker-ready structure", COLORS.green);

  cover.addText("Included in this deck", {
    x: 9.0,
    y: 5.4,
    w: 2.7,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 9.2,
    color: COLORS.muted,
    margin: 0
  });

  cover.addText(
    [
      "- Executive summary of the leader and why",
      "- Channel, content, cadence, and engagement views",
      "- Top videos, missing themes, and gap opportunities",
      "- Final ranking with transparent scoring logic"
    ].join("\n"),
    {
      x: 9.0,
      y: 5.66,
      w: 3.0,
      h: 0.9,
      fontFace: "Aptos",
      fontSize: 8.6,
      color: COLORS.text,
      margin: 0,
      fit: "shrink"
    }
  );

  const exec = pptx.addSlide();
  addHeader(exec, "Executive Summary", "Who leads in video marketing and why", 1, 12);

  const leader = scoresRanked[0];
  const runnerUp = scoresRanked[1];

  exec.addShape("roundRect", {
    x: 0.72,
    y: 1.32,
    w: 4.25,
    h: 4.95,
    fill: { color: COLORS.panel2 },
    line: { color: COLORS.line, pt: 1 }
  });

  exec.addText("Overall leader", {
    x: 0.96,
    y: 1.58,
    w: 2.2,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 8.8,
    color: COLORS.muted,
    margin: 0
  });
  exec.addText(leader?.company ?? "n/a", {
    x: 0.96,
    y: 1.85,
    w: 3.3,
    h: 0.42,
    fontFace: "Aptos Display",
    fontSize: 22,
    bold: true,
    color: COLORS.white,
    margin: 0,
    fit: "shrink"
  });
  exec.addText(`Weighted score ${leader ? leader.score.toFixed(1) : "n/a"}`, {
    x: 0.96,
    y: 2.35,
    w: 2.8,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10.5,
    color: COLORS.cyan,
    margin: 0
  });

  exec.addText(
    [
      `- Leader advantage comes from a stronger mix of scale, cadence, and consistency.`,
      `- Runner-up pressure is strongest where audience reach is high but cadence trails.`,
      `- The biggest opportunity is to convert topic breadth into repeatable engagement.`
    ].join("\n"),
    {
      x: 0.96,
      y: 2.72,
      w: 3.45,
      h: 1.25,
      fontFace: "Aptos",
      fontSize: 9.4,
      color: COLORS.text,
      margin: 0,
      fit: "shrink"
    }
  );

  addMetricCard(exec, 0.95, 4.25, 1.2, 1.2, "Gap", runnerUp && leader ? `${(leader.score - runnerUp.score).toFixed(1)}` : "n/a", "Score lead over second place", COLORS.gold);
  addMetricCard(exec, 2.22, 4.25, 1.2, 1.2, "Leader", leader?.company ?? "n/a", "Top weighted company", COLORS.purple);
  addMetricCard(exec, 3.49, 4.25, 1.2, 1.2, "Signal", normalizedLeaders.engagementRate?.company ?? "n/a", "Best audience response", COLORS.green);

  addSectionCallout(
    exec,
    5.25,
    1.32,
    3.25,
    4.95,
    "Why this matters",
    report.executiveSummary.concat([
      normalizedLeaders.subscribers ? `- Scale leader: ${normalizedLeaders.subscribers.company}` : "- Scale leader unavailable",
      normalizedLeaders.avgViews ? `- Reach leader: ${normalizedLeaders.avgViews.company}` : "- Reach leader unavailable",
      normalizedLeaders.postingFrequency ? `- Cadence leader: ${normalizedLeaders.postingFrequency.company}` : "- Cadence leader unavailable",
      normalizedLeaders.consistency ? `- Consistency leader: ${normalizedLeaders.consistency.company}` : "- Consistency leader unavailable"
    ]).join("\n"),
    COLORS.purple
  );

  addSectionCallout(
    exec,
    8.7,
    1.32,
    3.9,
    4.95,
    "Decision summary",
    [
      `Leader: ${leader?.company ?? "n/a"}`,
      `Runner-up: ${runnerUp?.company ?? "n/a"}`,
      `Best audience response: ${normalizedLeaders.engagementRate?.company ?? "n/a"}`,
      `Most active cadence: ${normalizedLeaders.postingFrequency?.company ?? "n/a"}`,
      `Best content breadth: ${normalizedLeaders.contentDiversity?.company ?? "n/a"}`
    ].join("\n"),
    COLORS.cyan
  );

  const channelSlide = pptx.addSlide();
  addHeader(channelSlide, "Channel Overview Comparison", "Subscriber scale, total videos, and upload frequency", 2, 12);

  channelSlide.addChart(
    pptx.ChartType.bar,
    [
      {
        name: "Subscribers",
        labels: companies,
        values: report.companies.map((company) => company.subscribers ?? 0)
      },
      {
        name: "Total Videos",
        labels: companies,
        values: report.companies.map((company) => company.totalVideos ?? company.videos.length)
      }
    ],
    {
      x: 0.72,
      y: 1.38,
      w: 8.15,
      h: 4.95,
      barDir: "col",
      catAxisLabelRotate: -25,
      showLegend: true,
      legendPos: "b",
      catAxisLabelColor: COLORS.text,
      valAxisLabelColor: COLORS.text,
      catAxisLabelFontSize: 9,
      valAxisLabelFontSize: 9,
      legendColor: COLORS.text
    }
  );

  channelSlide.addShape("roundRect", {
    x: 9.08,
    y: 1.38,
    w: 3.45,
    h: 4.95,
    fill: { color: COLORS.panel2 },
    line: { color: COLORS.line, pt: 1 }
  });

  channelSlide.addText("Upload frequency", {
    x: 9.32,
    y: 1.63,
    w: 2.2,
    h: 0.22,
    fontFace: "Aptos",
    fontSize: 8.8,
    color: COLORS.muted,
    margin: 0
  });

  const cadenceText = channelMetrics
    .map(
      (metric) =>
        `${metric.company}: ${metric.uploadsPerWeek.toFixed(2)}/week | consistency ${fmtPct(metric.consistency * 100, 0)}`
    )
    .join("\n");
  channelSlide.addText(cadenceText, {
    x: 9.32,
    y: 1.9,
    w: 2.9,
    h: 1.5,
    fontFace: "Aptos",
    fontSize: 9.1,
    color: COLORS.text,
    margin: 0,
    fit: "shrink"
  });

  addMetricCard(
    channelSlide,
    9.32,
    3.48,
    2.9,
    0.9,
    "Highest scale",
    normalizedLeaders.subscribers?.company ?? "n/a",
    `Subscribers: ${fmtCompact(normalizedLeaders.subscribers ? scoreByCompany.get(normalizedLeaders.subscribers.company)?.normalized.subscribers : undefined)}`,
    COLORS.purple
  );
  addMetricCard(
    channelSlide,
    9.32,
    4.47,
    2.9,
    0.9,
    "Most active",
    normalizedLeaders.postingFrequency?.company ?? "n/a",
    `Videos per week: ${normalizedLeaders.postingFrequency ? report.analysis.find((item) => item.company === normalizedLeaders.postingFrequency?.company)?.uploadsPerWeek.toFixed(2) : "n/a"}`,
    COLORS.green
  );
  addMetricCard(
    channelSlide,
    9.32,
    5.46,
    2.9,
    0.9,
    "Most consistent",
    normalizedLeaders.consistency?.company ?? "n/a",
    `Consistency score: ${normalizedLeaders.consistency ? fmtPct((scoreByCompany.get(normalizedLeaders.consistency.company)?.normalized.consistency ?? 0) * 100, 0) : "n/a"}`,
    COLORS.cyan
  );

  const topViewsSlide = pptx.addSlide();
  addHeader(topViewsSlide, "Content Performance - Top Videos by Views", "Which videos are pulling the biggest audience", 3, 12);

  topViewsSlide.addChart(
    pptx.ChartType.bar,
    [
      {
        name: "Top video views",
        labels: topVideoByViews.map((item) => item.company),
        values: topVideoByViews.map((item) => item.top?.views ?? 0)
      }
    ],
    {
      x: 0.72,
      y: 1.38,
      w: 12.0,
      h: 1.95,
      barDir: "col",
      showLegend: false,
      catAxisLabelRotate: -18,
      catAxisLabelColor: COLORS.text,
      valAxisLabelColor: COLORS.text,
      catAxisLabelFontSize: 9,
      valAxisLabelFontSize: 9,
      legendColor: COLORS.text
    }
  );

  const cardWidth = (12.0 - (companyCount - 1) * 0.12) / companyCount;
  topViewsSlide.addText("Per-company breakout", {
    x: 0.74,
    y: 3.45,
    w: 3.2,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 8.6,
    color: COLORS.muted,
    margin: 0
  });

  topVideoByViews.forEach((item, index) => {
    const x = 0.72 + index * (cardWidth + 0.12);
    const top = item.top;
    const runnerUp = item.runnerUp;
    const body = [
      `Top viewed: ${truncateText(top?.title ?? "n/a", cardWidth > 2.6 ? 28 : 22)}`,
      `Views: ${fmtCompact(top?.views)} | ER: ${fmtPct(videoEngagement(top ?? { title: "", url: "" }), 2)}`,
      `Runner-up: ${truncateText(runnerUp?.title ?? "n/a", cardWidth > 2.6 ? 26 : 20)}`,
      `Views: ${fmtCompact(runnerUp?.views)} | ER: ${fmtPct(videoEngagement(runnerUp ?? { title: "", url: "" }), 2)}`
    ].join("\n");

    addCard(topViewsSlide, x, 3.72, cardWidth, 2.85, COLORS.purple, item.company, body, 10.5, 8.7);
  });

  const topEngagementSlide = pptx.addSlide();
  addHeader(topEngagementSlide, "Content Performance - Top Videos by Engagement", "Which videos trigger the strongest audience response", 4, 12);

  topEngagementSlide.addChart(
    pptx.ChartType.bar,
    [
      {
        name: "Top engagement (%)",
        labels: topVideoByEngagement.map((item) => item.company),
        values: topVideoByEngagement.map((item) => videoEngagement(item.top ?? { title: "", url: "" }))
      }
    ],
    {
      x: 0.72,
      y: 1.38,
      w: 12.0,
      h: 1.95,
      barDir: "col",
      showLegend: false,
      catAxisLabelRotate: -18,
      catAxisLabelColor: COLORS.text,
      valAxisLabelColor: COLORS.text,
      catAxisLabelFontSize: 9,
      valAxisLabelFontSize: 9,
      legendColor: COLORS.text
    }
  );

  topEngagementSlide.addText("Per-company breakout", {
    x: 0.74,
    y: 3.45,
    w: 3.2,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 8.6,
    color: COLORS.muted,
    margin: 0
  });

  topVideoByEngagement.forEach((item, index) => {
    const x = 0.72 + index * (cardWidth + 0.12);
    const top = item.top;
    const analysis = item.analysis;
    const median = [...report.analysis].sort((left, right) => left.engagementRate - right.engagementRate)[Math.floor(report.analysis.length / 2)]?.engagementRate ?? 0;
    const body = [
      `Best engagement: ${truncateText(top?.title ?? "n/a", cardWidth > 2.6 ? 28 : 22)}`,
      `ER: ${fmtPct(videoEngagement(top ?? { title: "", url: "" }), 2)} | Views: ${fmtCompact(top?.views)}`,
      `${videoEngagement(top ?? { title: "", url: "" }) >= median ? "Above" : "Below"} peer median engagement`,
      `Channel avg ER: ${analysis ? fmtPct(analysis.engagementRate, 2) : "n/a"}`
    ].join("\n");

    addCard(topEngagementSlide, x, 3.72, cardWidth, 2.85, COLORS.green, item.company, body, 10.5, 8.7);
  });

  const topicsSlide = pptx.addSlide();
  addHeader(topicsSlide, "Content Topics and Themes", "What each company covers and what they are missing", 5, 12);

  topicsSlide.addChart(
    pptx.ChartType.bar,
    [
      {
        name: "Content category frequency",
        labels: categoryRanking.map((item) => item.topic),
        values: categoryRanking.map((item) => item.count)
      }
    ],
    {
      x: 0.72,
      y: 1.38,
      w: 4.75,
      h: 4.95,
      barDir: "bar",
      showLegend: false,
      catAxisLabelColor: COLORS.text,
      valAxisLabelColor: COLORS.text,
      catAxisLabelFontSize: 9,
      valAxisLabelFontSize: 9,
      legendColor: COLORS.text
    }
  );

  topicsSlide.addShape("roundRect", {
    x: 5.72,
    y: 1.38,
    w: 6.87,
    h: 4.95,
    fill: { color: COLORS.panel2 },
    line: { color: COLORS.line, pt: 1 }
  });

  topicsSlide.addText("Coverage by company", {
    x: 5.96,
    y: 1.62,
    w: 2.8,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 8.8,
    color: COLORS.muted,
    margin: 0
  });

  themeCoverageByCompany.forEach((item, index) => {
    const columnX = 5.96 + (index % 2) * 3.25;
    const rowY = 1.9 + Math.floor(index / 2) * 1.44;
    topicsSlide.addShape("roundRect", {
      x: columnX,
      y: rowY,
      w: 3.02,
      h: 1.28,
      fill: { color: COLORS.panel },
      line: { color: COLORS.line, pt: 1 }
    });

    topicsSlide.addText(item.company, {
      x: columnX + 0.12,
      y: rowY + 0.1,
      w: 2.4,
      h: 0.18,
      fontFace: "Aptos Display",
      fontSize: 10.2,
      bold: true,
      color: COLORS.white,
      margin: 0,
      fit: "shrink"
    });

    let pillX = columnX + 0.1;
    const pillY = rowY + 0.34;
    item.topics.slice(0, 2).forEach((topic) => {
      const width = addPill(topicsSlide, pillX, pillY, topic, COLORS.panel3, COLORS.text);
      pillX += width + 0.08;
    });

    topicsSlide.addText(`Missing: ${item.missing.length ? item.missing.join(", ") : "No major blind spots from this sample"}`, {
      x: columnX + 0.12,
      y: rowY + 0.75,
      w: 2.74,
      h: 0.34,
      fontFace: "Aptos",
      fontSize: 8.2,
      color: COLORS.muted,
      margin: 0,
      fit: "shrink"
    });
  });

  topicsSlide.addText("Most common content gaps in the set", {
    x: 0.78,
    y: 6.45,
    w: 3.6,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 8.5,
    color: COLORS.muted,
    margin: 0
  });
  topicsSlide.addText(
    themeCoverageByCompany
      .map((item) => `${item.company}: ${item.missing.slice(0, 2).join(", ") || "limited strategic gaps visible"}`)
      .join(" | "),
    {
      x: 0.78,
      y: 6.66,
      w: 11.8,
      h: 0.28,
      fontFace: "Aptos",
      fontSize: 8.5,
      color: COLORS.text,
      margin: 0,
      fit: "shrink"
    }
  );

  const cadenceSlide = pptx.addSlide();
  addHeader(cadenceSlide, "Posting Frequency and Consistency", "Who is most active and who keeps cadence stable", 6, 12);

  cadenceSlide.addChart(
    pptx.ChartType.bar,
    [
      {
        name: "Videos per week",
        labels: report.analysis.map((analysis) => analysis.company),
        values: report.analysis.map((analysis) => Number(analysis.uploadsPerWeek.toFixed(2)))
      },
      {
        name: "Consistency score",
        labels: report.analysis.map((analysis) => analysis.company),
        values: report.analysis.map((analysis) => Number((analysis.consistencyScore * 100).toFixed(2)))
      }
    ],
    {
      x: 0.72,
      y: 1.38,
      w: 8.2,
      h: 4.95,
      barDir: "col",
      showLegend: true,
      legendPos: "b",
      catAxisLabelColor: COLORS.text,
      valAxisLabelColor: COLORS.text,
      catAxisLabelFontSize: 9,
      valAxisLabelFontSize: 9,
      legendColor: COLORS.text
    }
  );

  addSectionCallout(
    cadenceSlide,
    9.12,
    1.38,
    3.42,
    1.24,
    "Cadence leader",
    `${normalizedLeaders.postingFrequency?.company ?? "n/a"} is the most active on a normalized basis and sets the tempo for the set.`,
    COLORS.green
  );
  addSectionCallout(
    cadenceSlide,
    9.12,
    2.78,
    3.42,
    1.24,
    "Consistency leader",
    `${normalizedLeaders.consistency?.company ?? "n/a"} keeps a steadier publishing pattern and reduces volatility in output.`,
    COLORS.cyan
  );
  addSectionCallout(
    cadenceSlide,
    9.12,
    4.18,
    3.42,
    1.24,
    "Strategic read",
    `The best program combines frequent publishing with a repeatable cadence, not just burst volume.`,
    COLORS.gold
  );

  cadenceSlide.addText("Cadence ranking", {
    x: 0.76,
    y: 6.48,
    w: 2.2,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 8.5,
    color: COLORS.muted,
    margin: 0
  });
  cadenceSlide.addText(
    report.analysis
      .slice()
      .sort((left, right) => right.uploadsPerWeek - left.uploadsPerWeek)
      .map((analysis) => `${analysis.company}: ${analysis.uploadsPerWeek.toFixed(2)}/week, consistency ${fmtPct(analysis.consistencyScore * 100, 0)}`)
      .join(" | "),
    {
      x: 0.76,
      y: 6.67,
      w: 11.9,
      h: 0.28,
      fontFace: "Aptos",
      fontSize: 8.2,
      color: COLORS.text,
      margin: 0,
      fit: "shrink"
    }
  );

  const engagementSlide = pptx.addSlide();
  addHeader(engagementSlide, "Engagement Analysis", "Average views, likes, and comments per video", 7, 12);

  engagementSlide.addChart(
    pptx.ChartType.bar,
    [
      {
        name: "Avg Views",
        labels: report.analysis.map((analysis) => analysis.company),
        values: report.analysis.map((analysis) => Math.round(analysis.avgViews))
      },
      {
        name: "Avg Likes",
        labels: report.analysis.map((analysis) => analysis.company),
        values: report.analysis.map((analysis) => Math.round(analysis.avgLikes))
      },
      {
        name: "Avg Comments",
        labels: report.analysis.map((analysis) => analysis.company),
        values: report.analysis.map((analysis) => Math.round(analysis.avgComments))
      }
    ],
    {
      x: 0.72,
      y: 1.38,
      w: 8.2,
      h: 4.95,
      barDir: "col",
      showLegend: true,
      legendPos: "b",
      catAxisLabelColor: COLORS.text,
      valAxisLabelColor: COLORS.text,
      catAxisLabelFontSize: 9,
      valAxisLabelFontSize: 9,
      legendColor: COLORS.text
    }
  );

  addMetricCard(
    engagementSlide,
    9.12,
    1.42,
    3.42,
    0.9,
    "Best reach",
    normalizedLeaders.avgViews?.company ?? "n/a",
    `Average views: ${normalizedLeaders.avgViews ? fmtCompact(report.analysis.find((item) => item.company === normalizedLeaders.avgViews?.company)?.avgViews) : "n/a"}`,
    COLORS.purple
  );
  addMetricCard(
    engagementSlide,
    9.12,
    2.42,
    3.42,
    0.9,
    "Best response",
    normalizedLeaders.engagementRate?.company ?? "n/a",
    `Avg engagement: ${normalizedLeaders.engagementRate ? fmtPct(report.analysis.find((item) => item.company === normalizedLeaders.engagementRate?.company)?.engagementRate, 2) : "n/a"}`,
    COLORS.green
  );
  addMetricCard(
    engagementSlide,
    9.12,
    3.42,
    3.42,
    0.9,
    "Most comments",
    normalizedLeaders.contentDiversity?.company ?? "n/a",
    `Conversation usually improves when topics are broader and formats vary.`,
    COLORS.cyan
  );
  addMetricCard(
    engagementSlide,
    9.12,
    4.42,
    3.42,
    0.9,
    "Reading the gap",
    "Efficiency beats raw reach",
    `High volume does not guarantee stronger interaction; balance matters.`,
    COLORS.gold
  );

  engagementSlide.addText("Per-company engagement summary", {
    x: 0.76,
    y: 6.48,
    w: 3.2,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 8.5,
    color: COLORS.muted,
    margin: 0
  });
  engagementSlide.addText(
    report.analysis
      .map(
        (analysis) =>
          `${analysis.company}: ${fmtCompact(analysis.avgViews)} views, ${fmtCompact(analysis.avgLikes)} likes, ${fmtCompact(analysis.avgComments)} comments, ER ${fmtPct(analysis.engagementRate, 2)}`
      )
      .join(" | "),
    {
      x: 0.76,
      y: 6.67,
      w: 11.9,
      h: 0.28,
      fontFace: "Aptos",
      fontSize: 8.1,
      color: COLORS.text,
      margin: 0,
      fit: "shrink"
    }
  );

  const gapSlide = pptx.addSlide();
  addHeader(gapSlide, "Gap Analysis", "Topics and formats competitors are not covering", 8, 12);

  gapSlide.addShape("roundRect", {
    x: 0.72,
    y: 1.38,
    w: 12.0,
    h: 4.95,
    fill: { color: COLORS.panel2 },
    line: { color: COLORS.line, pt: 1 }
  });

  gapSlide.addText("Priority opportunities", {
    x: 0.98,
    y: 1.62,
    w: 2.4,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 8.8,
    color: COLORS.muted,
    margin: 0
  });

  const gapHighlights = report.gaps.slice(0, 6);

  gapHighlights.forEach((gap, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const x = 0.98 + col * 5.85;
    const y = 1.92 + row * 1.58;
    gapSlide.addShape("roundRect", {
      x,
      y,
      w: 5.42,
      h: 1.4,
      fill: { color: COLORS.panel },
      line: { color: COLORS.line, pt: 1 }
    });
    // removed colored badge; keep numeric label
    gapSlide.addText(`${index + 1}`, {
      x: x + 0.12,
      y: y + 0.19,
      w: 0.48,
      h: 0.16,
      fontFace: "Aptos",
      fontSize: 8,
      bold: true,
      color: COLORS.text,
      align: "center",
      margin: 0
    });
    gapSlide.addText(gap, {
      x: x + 0.72,
      y: y + 0.1,
      w: 4.45,
      h: 0.52,
      fontFace: "Aptos Display",
      fontSize: 9.3,
      bold: true,
      color: COLORS.white,
      margin: 0,
      fit: "shrink"
    });
    gapSlide.addText("Why it matters: this creates room for stronger positioning, better retention, and a more differentiated content mix.", {
      x: x + 0.72,
      y: y + 0.66,
      w: 4.5,
      h: 0.34,
      fontFace: "Aptos",
      fontSize: 8.1,
      color: COLORS.muted,
      margin: 0,
      fit: "shrink"
    });
  });

  gapSlide.addText("What the set is missing overall", {
    x: 0.98,
    y: 5.6,
    w: 3.0,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 10,
    color: COLORS.muted,
    margin: 0
  });
  gapSlide.addText(report.gaps.join(" | "), {
    x: 0.98,
    y: 5.85,
    w: 11.1,
    h: 0.5,
    fontFace: "Aptos",
    fontSize: 9.5,
    color: COLORS.text,
    margin: 0,
    valign: "top",
    fit: "shrink"
  });

  gapSlide.addText("The strongest opportunities are where competitors are least active across category depth, cadence, and audience interaction.", {
    x: 0.98,
    y: 6.45,
    w: 11.2,
    h: 0.25,
    fontFace: "Aptos",
    fontSize: 9,
    color: COLORS.muted,
    margin: 0,
    fit: "shrink"
  });

  const recSlide = pptx.addSlide();
  addHeader(recSlide, "Video Marketing Recommendations", "Specific, actionable steps based on the data", 9, 12);

  report.recommendations.slice(0, 6).forEach((rec, index) => {
    const column = index % 3;
    const row = Math.floor(index / 3);
    const x = 0.72 + column * 4.07;
    const y = 1.48 + row * 2.22;
    addCard(
      recSlide,
      x,
      y,
      3.72,
      1.86,
      index === 0 ? COLORS.purple : index === 1 ? COLORS.cyan : index === 2 ? COLORS.gold : index === 3 ? COLORS.green : index === 4 ? COLORS.violet : COLORS.red,
      `Recommendation ${index + 1}`,
      rec,
      10.5,
      8.5
    );
  });

  recSlide.addText("Execution order", {
    x: 0.76,
    y: 6.48,
    w: 2.1,
    h: 0.18,
    fontFace: "Aptos",
    fontSize: 8.5,
    color: COLORS.muted,
    margin: 0
  });
  recSlide.addText("1. Fix the highest-opportunity gap  |  2. Publish the strongest format consistently  |  3. Measure lift in views, engagement, and cadence  |  4. Refresh the mix quarterly", {
    x: 0.76,
    y: 6.67,
    w: 11.9,
    h: 0.24,
    fontFace: "Aptos",
    fontSize: 8.2,
    color: COLORS.text,
    margin: 0,
    fit: "shrink"
  });

  const rankSlide = pptx.addSlide();
  addHeader(rankSlide, "Summary Ranking", "Score all companies on the key metrics used in the model", 10, 12);

  rankSlide.addChart(
    pptx.ChartType.bar,
    [
      {
        name: "Weighted score",
        labels: scoresRanked.map((score) => score.company),
        values: scoresRanked.map((score) => score.score)
      }
    ],
    {
      x: 0.72,
      y: 1.38,
      w: 8.2,
      h: 4.95,
      barDir: "bar",
      showLegend: false,
      catAxisLabelColor: COLORS.text,
      valAxisLabelColor: COLORS.text,
      catAxisLabelFontSize: 9,
      valAxisLabelFontSize: 9,
      legendColor: COLORS.text
    }
  );

  addMetricCard(
    rankSlide,
    9.12,
    1.42,
    3.42,
    0.88,
    "1st place",
    scoresRanked[0]?.company ?? "n/a",
    `Score: ${scoresRanked[0] ? scoresRanked[0].score.toFixed(1) : "n/a"}`,
    COLORS.purple
  );
  addMetricCard(
    rankSlide,
    9.12,
    2.42,
    3.42,
    0.88,
    "2nd place",
    scoresRanked[1]?.company ?? "n/a",
    `Score: ${scoresRanked[1] ? scoresRanked[1].score.toFixed(1) : "n/a"}`,
    COLORS.cyan
  );
  addMetricCard(
    rankSlide,
    9.12,
    3.42,
    3.42,
    0.88,
    "3rd place",
    scoresRanked[2]?.company ?? "n/a",
    `Score: ${scoresRanked[2] ? scoresRanked[2].score.toFixed(1) : "n/a"}`,
    COLORS.gold
  );
  addMetricCard(
    rankSlide,
    9.12,
    4.42,
    3.42,
    0.88,
    "Biggest factor",
    normalizedLeaders.avgViews?.company ?? "n/a",
    `Reach often drives the overall score when quality and cadence are close.`,
    COLORS.green
  );

  rankSlide.addText(report.rankingMethod, {
    x: 0.76,
    y: 6.48,
    w: 12.0,
    h: 0.52,
    fontFace: "Aptos",
    fontSize: 8.6,
    color: COLORS.muted,
    margin: 0,
    fit: "shrink"
  });

  const methodologySlide = pptx.addSlide();
  addHeader(methodologySlide, "Methodology and Scoring Logic", "How to interpret the analysis and the ranking", 11, 12);

  methodologySlide.addShape("roundRect", {
    x: 0.72,
    y: 1.38,
    w: 4.05,
    h: 4.95,
    fill: { color: COLORS.panel2 },
    line: { color: COLORS.line, pt: 1 }
  });
  methodologySlide.addText("Weighted scoring model", {
    x: 0.98,
    y: 1.63,
    w: 2.3,
    h: 0.2,
    fontFace: "Aptos",
    fontSize: 8.8,
    color: COLORS.muted,
    margin: 0
  });

  const weightRows: Array<{ label: string; value: string; accent: string }> = [
    { label: "Subscribers", value: "25%", accent: COLORS.purple },
    { label: "Avg views", value: "20%", accent: COLORS.cyan },
    { label: "Engagement rate", value: "20%", accent: COLORS.green },
    { label: "Posting frequency", value: "15%", accent: COLORS.gold },
    { label: "Consistency", value: "10%", accent: COLORS.violet },
    { label: "Content diversity", value: "10%", accent: COLORS.red }
  ];

  weightRows.forEach((row, index) => {
    const y = 1.95 + index * 0.52;
    methodologySlide.addText(row.label, {
      x: 1.02,
      y,
      w: 2.05,
      h: 0.18,
      fontFace: "Aptos",
      fontSize: 8.9,
      color: COLORS.text,
      margin: 0
    });
    methodologySlide.addShape("roundRect", {
      x: 2.75,
      y: y - 0.02,
      w: 1.12,
      h: 0.24,
      fill: { color: COLORS.panel3 },
      line: { color: COLORS.panel3, pt: 0 }
    });
    methodologySlide.addText(row.value, {
      x: 2.75,
      y: y + 0.01,
      w: 1.12,
      h: 0.14,
      fontFace: "Aptos",
      fontSize: 8.3,
      bold: true,
      align: "center",
      color: COLORS.white,
      margin: 0
    });
  });

  addSectionCallout(
    methodologySlide,
    5.0,
    1.38,
    3.7,
    2.25,
    "How to read the results",
    [
      "- Scores reward both scale and sustained performance.",
      "- A high score needs more than one strong metric.",
      "- Topic diversity matters when channels are competing for attention.",
      "- Cadence and consistency reduce volatility across a campaign window."
    ].join("\n"),
    COLORS.purple
  );

  addSectionCallout(
    methodologySlide,
    8.92,
    1.38,
    3.68,
    2.25,
    "Data quality guidance",
    [
      "- Full data means channel and video metrics were available.",
      "- Partial or limited data means the model used conservative fallback inference.",
      "- The report keeps the insight useful without pretending precision where data is thin."
    ].join("\n"),
    COLORS.cyan
  );

  addSectionCallout(
    methodologySlide,
    5.0,
    3.92,
    7.6,
    2.41,
    "Interpretation note",
    [
      `Leader: ${leader?.company ?? "n/a"}`,
      `Strongest reach: ${normalizedLeaders.avgViews?.company ?? "n/a"}`,
      `Strongest response: ${normalizedLeaders.engagementRate?.company ?? "n/a"}`,
      `Best cadence: ${normalizedLeaders.postingFrequency?.company ?? "n/a"}`,
      `Best breadth: ${normalizedLeaders.contentDiversity?.company ?? "n/a"}`
    ].join("\n"),
    COLORS.gold
  );

  methodologySlide.addText(
    "The goal is not to show every raw number. It is to surface which companies are winning, why they are winning, and where the next content advantage is likely to come from.",
    {
      x: 0.76,
      y: 6.62,
      w: 12.0,
      h: 0.28,
      fontFace: "Aptos",
      fontSize: 8.4,
      color: COLORS.text,
      margin: 0,
      fit: "shrink"
    }
  );

  const out = (await pptx.write({ outputType: "nodebuffer" })) as Buffer;
  return out;
}
