import { writeFileSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

/** @typedef {import('../src/lib/types').ReportPayload} ReportPayload */

/** @type {ReportPayload} */
const sampleOneCompany = {
  requestedAt: new Date().toISOString(),
  primaryCompany: "Acme Corp",
  competitors: ["Rival Inc"],
  companies: [
    {
      company: "Acme Corp",
      discovery: {
        company: "Acme Corp",
        confidence: "high",
        confidenceReason: "Exact match",
        candidates: []
      },
      subscribers: 120000,
      totalVideos: 84,
      videos: [
        {
          title: "How to build a better product launch video",
          url: "https://youtube.com/watch?v=1",
          views: 45000,
          likes: 1200,
          comments: 340,
          duration: "PT5M30S",
          tags: ["tutorial", "product"]
        },
        {
          title: "Customer success story: Enterprise rollout",
          url: "https://youtube.com/watch?v=2",
          views: 22000,
          likes: 800,
          comments: 120
        }
      ],
      dataQuality: "full",
      notes: []
    },
    {
      company: "Rival Inc",
      discovery: {
        company: "Rival Inc",
        confidence: "medium",
        confidenceReason: "Close match",
        candidates: []
      },
      subscribers: 95000,
      totalVideos: 62,
      videos: [
        {
          title: "Behind the scenes at our annual conference",
          url: "https://youtube.com/watch?v=3",
          views: 38000,
          likes: 900,
          comments: 200,
          duration: "PT8M"
        },
        {
          title: "Short tips for social video",
          url: "https://youtube.com/watch?v=4",
          views: 51000,
          likes: 1500,
          comments: 410,
          duration: "PT45S"
        }
      ],
      dataQuality: "full",
      notes: []
    }
  ],
  analysis: [
    {
      company: "Acme Corp",
      avgViews: 33500,
      avgLikes: 1000,
      avgComments: 230,
      engagementRate: 3.67,
      uploadsPerWeek: 2.1,
      videosPerMonth: 9,
      consistencyScore: 0.82,
      inactivePeriods: [],
      topTopics: ["product", "tutorial"],
      notes: []
    },
    {
      company: "Rival Inc",
      avgViews: 44500,
      avgLikes: 1200,
      avgComments: 305,
      engagementRate: 3.82,
      uploadsPerWeek: 1.4,
      videosPerMonth: 6,
      consistencyScore: 0.71,
      inactivePeriods: [],
      topTopics: ["event", "short"],
      notes: []
    }
  ],
  scores: [
    {
      company: "Acme Corp",
      score: 78.5,
      normalized: {
        subscribers: 0.85,
        avgViews: 0.72,
        engagementRate: 0.8,
        postingFrequency: 0.9,
        consistency: 0.88,
        contentDiversity: 0.75
      }
    },
    {
      company: "Rival Inc",
      score: 74.2,
      normalized: {
        subscribers: 0.7,
        avgViews: 0.88,
        engagementRate: 0.82,
        postingFrequency: 0.6,
        consistency: 0.7,
        contentDiversity: 0.68
      }
    }
  ],
  executiveSummary: [
    "Acme Corp leads on cadence and consistency while Rival Inc wins on raw reach per video.",
    "Both brands under-index on educational long-form content.",
    "Short-form adoption creates an opening for faster audience growth."
  ],
  recommendations: [
    "Publish weekly educational explainers to build authority.",
    "Add two customer proof videos per quarter.",
    "Test short-form clips repurposed from long videos.",
    "Standardize posting windows to improve consistency scores.",
    "Introduce thought-leadership interviews with industry guests.",
    "Measure engagement lift after each format experiment."
  ],
  gaps: [
    "Limited tutorial depth across the competitive set.",
    "Few customer case studies with measurable outcomes.",
    "Inconsistent publishing cadence among followers."
  ],
  rankingMethod:
    "Weighted score blends subscribers (25%), avg views (20%), engagement (20%), posting frequency (15%), consistency (10%), and content diversity (10%)."
};

function withExtraCompanies(base, names) {
  const extra = names.map((name, index) => ({
    company: name,
    discovery: {
      company: name,
      confidence: "medium",
      confidenceReason: "Sample",
      candidates: []
    },
    subscribers: 50000 + index * 15000,
    totalVideos: 40 + index * 5,
    videos: [
      {
        title: `${name} product overview and launch highlights`,
        url: `https://youtube.com/watch?v=${index + 10}`,
        views: 30000 + index * 5000,
        likes: 600 + index * 50,
        comments: 90 + index * 10,
        duration: "PT4M"
      }
    ],
    dataQuality: "full",
    notes: []
  }));

  const extraAnalysis = names.map((name, index) => ({
    company: name,
    avgViews: 28000 + index * 4000,
    avgLikes: 500 + index * 40,
    avgComments: 80 + index * 8,
    engagementRate: 2.5 + index * 0.3,
    uploadsPerWeek: 1 + index * 0.2,
    videosPerMonth: 5,
    consistencyScore: 0.65 + index * 0.05,
    inactivePeriods: [],
    topTopics: ["product"],
    notes: []
  }));

  const extraScores = names.map((name, index) => ({
    company: name,
    score: 70 - index * 2,
    normalized: {
      subscribers: 0.6 - index * 0.05,
      avgViews: 0.65,
      engagementRate: 0.7,
      postingFrequency: 0.55,
      consistency: 0.6,
      contentDiversity: 0.65
    }
  }));

  return {
    ...base,
    competitors: [...base.competitors, ...names],
    companies: [...base.companies, ...extra],
    analysis: [...base.analysis, ...extraAnalysis],
    scores: [...base.scores, ...extraScores]
  };
}

async function main() {
  const { generatePpt } = await import("../src/lib/ppt/index.ts");

  const twoCompany = await generatePpt(sampleOneCompany);
  writeFileSync("test-output-refactored.pptx", twoCompany);
  console.log("Wrote test-output-refactored.pptx (2 companies)", twoCompany.length, "bytes");

  const fourCompany = await generatePpt(withExtraCompanies(sampleOneCompany, ["Beta Co", "Gamma LLC"]));
  writeFileSync("test-output-4companies.pptx", fourCompany);
  console.log("Wrote test-output-4companies.pptx (4 companies)", fourCompany.length, "bytes");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
