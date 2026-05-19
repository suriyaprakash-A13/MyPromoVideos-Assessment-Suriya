"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  ReferenceLine,
  ZAxis,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { ReportPayload } from "@/lib/types";

interface FormState {
  primaryCompany: string;
  competitors: string[];
}

const defaultForm: FormState = {
  primaryCompany: "",
  competitors: ["", "", "", ""]
};

const CHART_COLORS = ["#a855f7", "#d946ef", "#22d3ee", "#34d399", "#f59e0b"];

function fmt(value: number | undefined): string {
  if (!value || Number.isNaN(value)) {
    return "n/a";
  }
  return new Intl.NumberFormat().format(Math.round(value));
}

function fmtCompact(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export default function HomePage(): React.JSX.Element {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [report, setReport] = useState<ReportPayload | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scoreData = useMemo(
    () => report?.scores.map((score) => ({ company: score.company, score: score.score })) ?? [],
    [report]
  );

  const engagementData = useMemo(
    () =>
      report?.analysis.map((analysis) => ({
        company: analysis.company,
        avgViews: Math.round(analysis.avgViews),
        engagementRate: Number(analysis.engagementRate.toFixed(2)),
        uploadsPerWeek: Number(analysis.uploadsPerWeek.toFixed(2)),
        avgLikes: Math.round(analysis.avgLikes),
        avgComments: Math.round(analysis.avgComments)
      })) ?? [],
    [report]
  );

  const engagementMedians = useMemo(() => {
    if (!report?.analysis.length) {
      return { avgViews: 0, engagementRate: 0 };
    }

    const values = report.analysis;
    const sortedViews = values.map((analysis) => analysis.avgViews).sort((left, right) => left - right);
    const sortedEngagement = values.map((analysis) => analysis.engagementRate).sort((left, right) => left - right);
    const midpoint = Math.floor(values.length / 2);

    return {
      avgViews: sortedViews[midpoint] ?? 0,
      engagementRate: sortedEngagement[midpoint] ?? 0
    };
  }, [report]);

  const radarData = useMemo(() => {
    if (!report?.scores.length) {
      return [];
    }

    const leader = report.scores[0];
    return [
      { metric: "Subscribers", value: Math.round(leader.normalized.subscribers * 100) },
      { metric: "Views", value: Math.round(leader.normalized.avgViews * 100) },
      { metric: "Engagement", value: Math.round(leader.normalized.engagementRate * 100) },
      { metric: "Frequency", value: Math.round(leader.normalized.postingFrequency * 100) },
      { metric: "Consistency", value: Math.round(leader.normalized.consistency * 100) },
      { metric: "Diversity", value: Math.round(leader.normalized.contentDiversity * 100) }
    ];
  }, [report]);

  const chartAxisStyle = {
    stroke: "var(--muted)",
    fontSize: 12,
    fontWeight: 500
  };

  const chartTooltipStyle = {
    background: "var(--tooltip-bg)",
    border: "1px solid var(--border-strong)",
    borderRadius: 8,
    color: "var(--ink)",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.08)"
  };

  const cleanCompetitors = form.competitors.map((name) => name.trim()).filter(Boolean);

  async function onAnalyze(event: FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);

    const primary = form.primaryCompany.trim();
    const competitors = cleanCompetitors;

    if (!primary) {
      setError("Primary company is required.");
      return;
    }

    if (competitors.length > 4) {
      setError("Maximum 4 competitors allowed.");
      return;
    }

    const duplicateCheck = [primary, ...competitors].map((item) => item.toLowerCase());
    if (new Set(duplicateCheck).size !== duplicateCheck.length) {
      setError("Company names must be unique.");
      return;
    }

    setLoading(true);
    setStatus("Searching public web and mapping official channels...");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primaryCompany: primary, competitors })
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.message || "Analysis failed.");
      }

      setStatus("Analyzing benchmark metrics and generating strategic insights...");
      const data = (await res.json()) as ReportPayload;
      setReport(data);
      setStatus("Complete");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
      setReport(null);
    } finally {
      setLoading(false);
    }
  }

  async function onDownloadPptx(): Promise<void> {
    if (!report) {
      return;
    }

    setStatus("Generating PowerPoint deck...");
    const res = await fetch("/api/pptx", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report })
    });

    if (!res.ok) {
      const body = await res.json();
      setError(body.message || "PPTX export failed.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${report.primaryCompany.replace(/\s+/g, "-").toLowerCase()}-video-benchmark.pptx`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setStatus("PowerPoint downloaded");
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-topline">
          <span className="hero-chip">Premium competitor intelligence</span>
          <span className="hero-chip">Web preview + PPT export</span>
        </div>
        <h1>Video Benchmark Intelligence</h1>
        <p>
          Enter your company and up to 4 competitors. The app discovers public video/channel data, analyzes strategic
          performance, previews a polished report, and exports a client-ready PowerPoint deck.
        </p>
      </section>

      <section className="panel" style={{ animation: "fadeInUp 0.6s ease 0.15s both" }}>
        <form onSubmit={onAnalyze} className="grid">
          <div className="muted-box">
            <label htmlFor="primary">Primary company</label>
            <input
              id="primary"
              placeholder="Example: HubSpot"
              value={form.primaryCompany}
              onChange={(e) => setForm((prev) => ({ ...prev, primaryCompany: e.target.value }))}
            />
          </div>

          <div className="grid two">
            {form.competitors.map((company, index) => (
              <div key={index} className="muted-box">
                <label htmlFor={`competitor-${index}`}>Competitor {index + 1}</label>
                <input
                  id={`competitor-${index}`}
                  placeholder="Optional"
                  value={company}
                  onChange={(e) =>
                    setForm((prev) => {
                      const next = [...prev.competitors];
                      next[index] = e.target.value;
                      return { ...prev, competitors: next };
                    })
                  }
                />
              </div>
            ))}
          </div>

          <div className="inline-note">Validation: unique names, max 4 competitors, partial-data fallback enabled.</div>

          <div className="button-row">
            <button type="submit" disabled={loading}>
              {loading ? <><span className="loading-spinner" />Analyzing...</> : "Analyze"}
            </button>
            <span className="small">{status}</span>
          </div>

          {error ? <div style={{ color: "#b91c1c", fontWeight: 600 }}>{error}</div> : null}
        </form>
      </section>

      {report ? (
        <>
          {/* ── Report Preview Header ── */}
          <section className="panel anim-section">
            <div className="report-header">
              <div>
                <h2 className="section-title">Report Preview</h2>
                <p className="section-subtitle">Assessment-ready web preview before export</p>
              </div>
              <button className="secondary" onClick={onDownloadPptx}>
                Download PowerPoint
              </button>
            </div>

            <div className="metric-grid" style={{ marginTop: "1rem" }}>
              <div className="metric-card">
                <span className="small">Companies analyzed</span>
                <strong>{report.companies.length}</strong>
              </div>
              <div className="metric-card">
                <span className="small">Leader</span>
                <strong>{report.scores[0]?.company ?? "n/a"}</strong>
              </div>
              <div className="metric-card">
                <span className="small">Top score</span>
                <strong>{report.scores[0]?.score ?? 0}</strong>
              </div>
              <div className="metric-card">
                <span className="small">Generated</span>
                <strong>{new Date(report.requestedAt).toLocaleDateString()}</strong>
              </div>
            </div>
          </section>

          {/* ── Executive Summary + Ranking ── */}
          <section className="grid two anim-section">
            <article className="panel" style={{ "--panel-accent": "var(--accent-cyan)" } as React.CSSProperties}>
              <h3 className="section-title">Executive Summary</h3>
              <p className="section-subtitle">The strategic readout at a glance</p>
              <div className="divider" />
              <ul className="list">
                {report.executiveSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="panel" style={{ "--panel-accent": "var(--accent-purple)" } as React.CSSProperties}>
              <h3 className="section-title">Ranking Model</h3>
              <p className="section-subtitle">Transparent weighted scoring logic</p>
              <div className="divider" />
              <p className="inline-note" style={{ marginTop: "0.4rem" }}>
                {report.rankingMethod}
              </p>
            </article>
          </section>

          {/* ── Charts Row: Scores + Radar ── */}
          <section className="grid two anim-section">
            <article className="panel chart-panel" style={{ "--panel-accent": "var(--accent-pink)" } as React.CSSProperties}>
              <h3 className="section-title">Weighted Score Comparison</h3>
              <p className="section-subtitle">Which brand leads on the overall model</p>
              <div className="chart-wrap">
                <ResponsiveContainer>
                  <BarChart data={scoreData} margin={{ top: 16, right: 14, left: 6, bottom: 4 }}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#d946ef" stopOpacity={1} />
                        <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.85} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="company" tick={chartAxisStyle} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={chartAxisStyle}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => fmtCompact(Number(value))}
                      width={44}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                    <Bar
                      dataKey="score"
                      radius={[12, 12, 0, 0]}
                      barSize={42}
                      animationBegin={200}
                      animationDuration={1200}
                      animationEasing="ease-out"
                    >
                      {scoreData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel chart-panel" style={{ "--panel-accent": "var(--accent-green)" } as React.CSSProperties}>
              <h3 className="section-title">Leader Profile Radar</h3>
              <p className="section-subtitle">The strongest company&apos;s normalized profile</p>
              <div className="chart-wrap">
                <ResponsiveContainer>
                  <RadarChart data={radarData} margin={{ top: 12, right: 8, bottom: 10, left: 8 }}>
                    <PolarGrid stroke="var(--border)" gridType="polygon" />
                    <PolarAngleAxis dataKey="metric" stroke="var(--muted)" tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 500 }} />
                    <Radar
                      dataKey="value"
                      fill="#3b82f6"
                      fillOpacity={0.15}
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      animationBegin={400}
                      animationDuration={1400}
                      animationEasing="ease-out"
                      dot={{ r: 5, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }}
                    />
                    <Tooltip contentStyle={chartTooltipStyle} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          {/* ── Scatter Chart ── */}
          <section className="panel chart-panel anim-section">
            <h3 className="section-title">Reach vs Engagement Efficiency</h3>
            <p className="section-subtitle">Each point shows average views and engagement rate; size reflects publishing cadence</p>
            <div className="chart-wrap" style={{ height: 340 }}>
              <ResponsiveContainer>
                <ScatterChart margin={{ top: 24, right: 30, left: 18, bottom: 28 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    type="number"
                    dataKey="avgViews"
                    name="Avg Views"
                    domain={[
                      (min: number) => Math.max(0, min - Math.max(20000, min * 0.08)),
                      (max: number) => max + Math.max(20000, max * 0.1)
                    ]}
                    tick={chartAxisStyle}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => fmtCompact(Number(value))}
                    width={66}
                    label={{ value: "Average views", position: "bottom", fill: "var(--muted)", fontSize: 12 }}
                  />
                  <YAxis
                    type="number"
                    dataKey="engagementRate"
                    name="Engagement rate"
                    domain={[
                      (min: number) => Math.max(0, min - 0.25),
                      (max: number) => max + 0.25
                    ]}
                    tick={chartAxisStyle}
                    axisLine={false}
                    tickLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${Number(value).toFixed(1)}%`}
                    width={60}
                    label={{ value: "Engagement rate", angle: -90, position: "left", fill: "var(--muted)", fontSize: 12 }}
                  />
                  <ZAxis type="number" dataKey="uploadsPerWeek" name="Uploads/week" range={[60, 260]} />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <ReferenceLine x={engagementMedians.avgViews} stroke="var(--muted)" strokeDasharray="4 4" />
                  <ReferenceLine y={engagementMedians.engagementRate} stroke="var(--muted)" strokeDasharray="4 4" />
                  <Scatter
                    data={engagementData}
                    name="Company positioning"
                    animationBegin={600}
                    animationDuration={1600}
                    animationEasing="ease-out"
                  >
                    {engagementData.map((_entry, index) => (
                      <Cell key={`scatter-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            <div className="inline-note" style={{ marginTop: "0.75rem" }}>
              Quadrants help separate scale leaders from engagement-efficient brands. Higher-right points are the strongest mix of reach and response.
            </div>
          </section>

          {/* ── Company Findings ── */}
          <section className="panel anim-section">
            <h3 className="section-title">Company Findings</h3>
            <p className="section-subtitle">Confidence, metadata, cadence, and strategic notes per company</p>
            <div className="grid two">
              {report.companies.map((company) => {
                const analysis = report.analysis.find((a) => a.company === company.company);
                return (
                  <article key={company.company} className="muted-box" style={{ minHeight: 200, borderLeft: "4px solid var(--accent-amber)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                      <strong>{company.company}</strong>
                      <span className={`status ${company.discovery.confidence}`}>{company.discovery.confidence}</span>
                    </div>
                    <div className="inline-note" style={{ marginTop: "0.4rem" }}>
                      {company.discovery.confidenceReason}
                    </div>
                    <div className="small" style={{ marginTop: "0.4rem" }}>
                      Channel ID: {company.discovery.channelId ?? "n/a"}
                    </div>
                    <div className="small" style={{ marginTop: "0.25rem" }}>
                      Created: {company.channelCreatedAt ? new Date(company.channelCreatedAt).toLocaleDateString() : "n/a"}
                    </div>
                    <div className="small" style={{ marginTop: "0.7rem" }}>
                      Subscribers: {fmt(company.subscribers)} | Total videos: {fmt(company.totalVideos)}
                    </div>
                    <div className="small" style={{ marginTop: "0.25rem" }}>
                      Channel views: {fmt(company.channelViews)} | Preview videos: {company.videos.length}
                    </div>
                    <div className="small" style={{ marginTop: "0.25rem" }}>
                      Avg views: {fmt(analysis?.avgViews)} | Engagement: {(analysis?.engagementRate ?? 0).toFixed(2)}%
                    </div>
                    <div className="small" style={{ marginTop: "0.25rem" }}>
                      Uploads/week: {(analysis?.uploadsPerWeek ?? 0).toFixed(2)} | Consistency: {Math.round((analysis?.consistencyScore ?? 0) * 100)}%
                    </div>
                    <div className="small" style={{ marginTop: "0.25rem" }}>
                      Topics: {analysis?.topTopics.join(", ") || "Not enough data"}
                    </div>
                    {analysis?.inactivePeriods?.length ? (
                      <div className="small" style={{ marginTop: "0.25rem" }}>
                        Inactive periods: {analysis.inactivePeriods.length}
                      </div>
                    ) : null}
                    {company.notes.length ? (
                      <ul className="list small" style={{ marginTop: "0.6rem" }}>
                        {company.notes.slice(0, 3).map((note) => (
                          <li key={note}>{note}</li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>

          {/* ── Gaps + Recommendations ── */}
          <section className="grid two anim-section">
            <article className="panel" style={{ "--panel-accent": "var(--accent-blue)" } as React.CSSProperties}>
              <h3 className="section-title">Gap Analysis</h3>
              <p className="section-subtitle">Where competitors are leaving space open</p>
              <div className="divider" />
              <ul className="list">
                {report.gaps.map((gap) => (
                  <li key={gap}>{gap}</li>
                ))}
              </ul>
            </article>

            <article className="panel" style={{ "--panel-accent": "var(--accent-cyan)" } as React.CSSProperties}>
              <h3 className="section-title">Recommendations</h3>
              <p className="section-subtitle">Next actions for a stronger video strategy</p>
              <div className="divider" />
              <ul className="list">
                {report.recommendations.map((rec) => (
                  <li key={rec}>{rec}</li>
                ))}
              </ul>
            </article>
          </section>
        </>
      ) : null}

      <svg width="0" height="0" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
    </main>
  );
}
