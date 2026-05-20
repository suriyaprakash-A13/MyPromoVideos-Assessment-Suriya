"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { CHART_COLORS_DARK, CHART_COLORS_LIGHT } from "@/lib/uiTheme";
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
  const [status, setStatus] = useState<string | null>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chartColors, setChartColors] = useState<string[]>([...CHART_COLORS_LIGHT]);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (): void => {
      setChartColors([...(media.matches ? CHART_COLORS_DARK : CHART_COLORS_LIGHT)]);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

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
    try {
      const res = await fetch("/api/pptx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report })
      });

      if (!res.ok) {
        const body = await res.json();
        setError(body.message || "PPTX export failed.");
        setStatus(null);
        return;
      }

      const rawBlob = await res.blob();
      const blob = new Blob([rawBlob], { type: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
      const url = URL.createObjectURL(blob);
      
      const safeName = report.primaryCompany.replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").toLowerCase() || "company";
      const anchor = document.createElement("a");
      anchor.style.display = "none";
      anchor.href = url;
      anchor.download = `${safeName}-video-benchmark.pptx`;
      document.body.appendChild(anchor);
      anchor.click();
      
      // Delay cleanup to ensure Firefox/Safari don't abort the download
      setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }, 1500);
      
      setStatus("PowerPoint downloaded");
    } catch (err) {
      setError("An unexpected error occurred while downloading.");
      setStatus(null);
    }
  }

  async function onEmailReport(): Promise<void> {
    if (!report || !emailTo.trim()) {
      return;
    }

    setEmailSending(true);
    setEmailSent(false);
    setError(null);
    setStatus("Generating deck and sending email...");

    try {
      const res = await fetch("/api/email-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTo.trim(), report })
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(body.message || "Failed to send email.");
        setStatus(null);
        return;
      }

      setEmailSent(true);
      setStatus(`Report sent to ${emailTo.trim()}`);
      setEmailOpen(false);
    } catch {
      setError("An unexpected error occurred while sending email.");
      setStatus(null);
    } finally {
      setEmailSending(false);
    }
  }

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTo.trim());

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z" />
              <path d="M6 10v4" />
              <path d="M10 8v6" />
            </svg>
            <span>Intellecta VBI</span>
          </div>
          <div className="sidebar-desc">
            Compare video channel reach, subscriber metrics, posting cadence, and engagement rates.
          </div>
        </div>

        <div className="divider" style={{ margin: "0.5rem 0" }} />

        <form onSubmit={onAnalyze} className="grid" style={{ gap: "1.2rem" }}>
          <div className="muted-box">
            <label htmlFor="primary">Primary Company</label>
            <input
              id="primary"
              placeholder="e.g., HubSpot"
              value={form.primaryCompany}
              onChange={(e) => setForm((prev) => ({ ...prev, primaryCompany: e.target.value }))}
              disabled={loading}
            />
          </div>

          <div className="grid" style={{ gap: "0.8rem" }}>
            {form.competitors.map((company, index) => (
              <div key={index} className="muted-box" style={{ padding: "0.8rem 1rem" }}>
                <label htmlFor={`competitor-${index}`} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Competitor {index + 1}</span>
                  {company && <span style={{ color: "var(--primary)", fontSize: "0.75rem", fontWeight: 700 }}>Active</span>}
                </label>
                <input
                  id={`competitor-${index}`}
                  placeholder="Optional competitor name"
                  value={company}
                  onChange={(e) =>
                    setForm((prev) => {
                      const next = [...prev.competitors];
                      next[index] = e.target.value;
                      return { ...prev, competitors: next };
                    })
                  }
                  disabled={loading}
                  style={{ padding: "0.6rem 0.8rem", fontSize: "0.9rem" }}
                />
              </div>
            ))}
          </div>

          <div className="inline-note" style={{ fontSize: "0.8rem", marginTop: "-0.2rem" }}>
            Validation: unique brand names required. Partial metrics fallback is active.
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button type="submit" disabled={loading} style={{ width: "100%" }}>
              {loading ? (
                <>
                  <span className="loading-spinner" />
                  Analyzing Channels...
                </>
              ) : (
                "Analyze Competitors"
              )}
            </button>
            {status ? <div className="status-line">{status}</div> : null}
          </div>

          {error ? <div className="error-banner">{error}</div> : null}
        </form>

        <div className="sidebar-footer">
          Video Benchmark Intelligence<br />
          v1.1.0 • Client-Ready Deck Exporter
        </div>
      </aside>

      <main className="main-content">
        {loading ? (
          <div className="skeleton-dashboard" style={{ display: "flex", flexDirection: "column", gap: "2rem", animation: "fadeIn 0.5s ease both" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ width: "60%" }}>
                <div className="skeleton skeleton-title" style={{ width: "50%" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "70%" }}></div>
              </div>
              <div className="skeleton" style={{ width: "120px", height: "40px", borderRadius: "10px" }}></div>
            </div>
            
            <div className="metric-grid">
              {[1, 2, 3, 4].map((id) => (
                <div key={id} className="skeleton-card" style={{ height: "120px" }}>
                  <div className="skeleton skeleton-text short"></div>
                  <div className="skeleton skeleton-title" style={{ width: "40%", height: "32px", margin: "10px auto 0" }}></div>
                </div>
              ))}
            </div>

            <div className="grid two">
              <div className="skeleton-card" style={{ height: "260px" }}>
                <div className="skeleton skeleton-title" style={{ width: "40%" }}></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
              </div>
              <div className="skeleton-card" style={{ height: "260px" }}>
                <div className="skeleton skeleton-title" style={{ width: "40%" }}></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
              </div>
            </div>

            <div className="skeleton-card" style={{ height: "300px" }}>
              <div className="skeleton skeleton-title" style={{ width: "25%" }}></div>
              <div style={{ display: "flex", gap: "1rem", flexGrow: 1, alignItems: "flex-end" }}>
                <div className="skeleton" style={{ width: "15%", height: "40%", borderRadius: "6px 6px 0 0" }}></div>
                <div className="skeleton" style={{ width: "15%", height: "70%", borderRadius: "6px 6px 0 0" }}></div>
                <div className="skeleton" style={{ width: "15%", height: "55%", borderRadius: "6px 6px 0 0" }}></div>
                <div className="skeleton" style={{ width: "15%", height: "90%", borderRadius: "6px 6px 0 0" }}></div>
                <div className="skeleton" style={{ width: "15%", height: "30%", borderRadius: "6px 6px 0 0" }}></div>
              </div>
            </div>
          </div>
        ) : report ? (
          <>
            {/* ── Report Preview Header ── */}
            <div className="report-header report-header-anim" style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
              <div>
                <h1 style={{ margin: 0, fontFamily: "Space Grotesk, sans-serif", fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-0.03em" }}>
                  Benchmark Intelligence Report
                </h1>
                <p style={{ margin: "0.4rem 0 0", color: "var(--muted)", fontSize: "1.05rem" }}>
                  Competitor analytics and strategic positioning readout for <strong>{report.primaryCompany}</strong>
                </p>
              </div>
              <div className="report-actions">
                <span className="small">
                  Generated: <strong>{new Date(report.requestedAt).toLocaleDateString()}</strong>
                </span>
                <button type="button" className="secondary" onClick={(e) => { e.preventDefault(); onDownloadPptx(); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Export PPTX
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={(e) => {
                    e.preventDefault();
                    setEmailOpen((open) => !open);
                    setEmailSent(false);
                  }}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email deck
                </button>
              </div>
              {emailOpen ? (
                <div className="email-panel" style={{ width: "100%", marginTop: "1rem" }}>
                  <p className="email-panel-title">Send PowerPoint report</p>
                  <div className="email-input-row">
                    <input
                      type="email"
                      placeholder="client@agency.com"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      disabled={emailSending}
                      aria-label="Recipient email"
                    />
                    <button type="button" onClick={onEmailReport} disabled={emailSending || !emailValid}>
                      {emailSending ? (
                        <>
                          <span className="loading-spinner" />
                          Sending...
                        </>
                      ) : (
                        "Send report"
                      )}
                    </button>
                    <button type="button" className="secondary" onClick={() => setEmailOpen(false)} disabled={emailSending}>
                      Cancel
                    </button>
                  </div>
                  {emailSent ? <p className="email-success">Report emailed successfully.</p> : null}
                </div>
              ) : null}
            </div>

            {report.bestTimeToPost ? (
              <section className="best-time-panel anim-section">
                <div className="best-time-header">
                  <div>
                    <p className="small" style={{ margin: "0 0 0.35rem", color: "var(--primary)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Best time to post
                    </p>
                    <h2 className="best-time-headline">{report.bestTimeToPost.headline}</h2>
                  </div>
                  <div className="best-time-badges">
                    <span className="multiplier-badge">{report.bestTimeToPost.engagementMultiplier}× engagement</span>
                    <span className={`confidence-badge ${report.bestTimeToPost.confidence}`}>{report.bestTimeToPost.confidence} confidence</span>
                  </div>
                </div>
                <ul className="best-time-details">
                  {report.bestTimeToPost.details.map((detail) => (
                    <li key={detail}>{detail}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            <div className="metric-grid" style={{ marginBottom: "1.5rem" }}>
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
                <span className="small">Leader Engagement</span>
                <strong>
                  {report.analysis.find((a) => a.company === (report.scores[0]?.company))
                    ? `${(report.analysis.find((a) => a.company === (report.scores[0]?.company))?.engagementRate ?? 0).toFixed(1)}%`
                    : "n/a"}
                </strong>
              </div>
            </div>

            {/* ── Executive Summary + Ranking ── */}
            <section className="grid two anim-section" style={{ marginBottom: "1.5rem" }}>
              <article className="panel" style={{ "--panel-accent": "var(--primary)" } as React.CSSProperties}>
                <h3 className="section-title">Executive Summary</h3>
                <p className="section-subtitle">The strategic readout at a glance</p>
                <div className="divider" />
                <ul className="list">
                  {report.executiveSummary.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>

              <article className="panel" style={{ "--panel-accent": "var(--accent-magenta)" } as React.CSSProperties}>
                <h3 className="section-title">Ranking Model</h3>
                <p className="section-subtitle">Transparent weighted scoring logic</p>
                <div className="divider" />
                <p className="inline-note" style={{ marginTop: "0.4rem" }}>
                  {report.rankingMethod}
                </p>
              </article>
            </section>

            {/* ── Charts Row: Scores + Radar ── */}
            <section className="grid two anim-section" style={{ marginBottom: "1.5rem" }}>
              <article className="panel chart-panel" style={{ "--panel-accent": "var(--accent-magenta)" } as React.CSSProperties}>
                <h3 className="section-title">Weighted Score Comparison</h3>
                <p className="section-subtitle">Which brand leads on the overall model</p>
                <div className="chart-wrap">
                  <ResponsiveContainer>
                    <BarChart data={scoreData} margin={{ top: 16, right: 14, left: 6, bottom: 4 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={chartColors[1]} stopOpacity={1} />
                          <stop offset="100%" stopColor={chartColors[0]} stopOpacity={0.85} />
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
                          <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="panel chart-panel" style={{ "--panel-accent": "var(--chart-3)" } as React.CSSProperties}>
                <h3 className="section-title">Leader Profile Radar</h3>
                <p className="section-subtitle">The strongest company&apos;s normalized profile</p>
                <div className="chart-wrap">
                  <ResponsiveContainer>
                    <RadarChart data={radarData} margin={{ top: 12, right: 8, bottom: 10, left: 8 }}>
                      <PolarGrid stroke="var(--border)" gridType="polygon" />
                      <PolarAngleAxis dataKey="metric" stroke="var(--muted)" tick={{ fill: "var(--muted)", fontSize: 12, fontWeight: 500 }} />
                      <Radar
                        dataKey="value"
                        fill={chartColors[0]}
                        fillOpacity={0.2}
                        stroke={chartColors[0]}
                        strokeWidth={2.5}
                        animationBegin={400}
                        animationDuration={1400}
                        animationEasing="ease-out"
                        dot={{ r: 5, fill: chartColors[0], stroke: "var(--card)", strokeWidth: 2 }}
                      />
                      <Tooltip contentStyle={chartTooltipStyle} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>

            {/* ── Scatter Chart ── */}
            <section className="panel chart-panel anim-section" style={{ marginBottom: "1.5rem" }}>
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
                        <Cell key={`scatter-${index}`} fill={chartColors[index % chartColors.length]} />
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
            <section className="panel anim-section" style={{ marginBottom: "1.5rem" }}>
              <h3 className="section-title">Company Findings</h3>
              <p className="section-subtitle">Confidence, metadata, cadence, and strategic notes per company</p>
              <div className="grid two" style={{ marginTop: "1rem" }}>
                {report.companies.map((company) => {
                  const analysis = report.analysis.find((a) => a.company === company.company);
                  return (
                    <article key={company.company} className="muted-box company-card-accent" style={{ minHeight: 200 }}>
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
            <section className="grid two anim-section" style={{ marginBottom: "1.5rem" }}>
              <article className="panel" style={{ "--panel-accent": "var(--chart-4)" } as React.CSSProperties}>
                <h3 className="section-title">Gap Analysis</h3>
                <p className="section-subtitle">Where competitors are leaving space open</p>
                <div className="divider" />
                <ul className="list">
                  {report.gaps.map((gap) => (
                    <li key={gap}>{gap}</li>
                  ))}
                </ul>
              </article>

              <article className="panel" style={{ "--panel-accent": "var(--accent-magenta)" } as React.CSSProperties}>
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
        ) : (
          /* Onboarding state */
          <div className="page-enter">
            <section className="hero" style={{ marginBottom: "2rem" }}>
              <div className="hero-topline">
                <span className="hero-chip">Real-time Data Scraping</span>
                <span className="hero-chip">Strategic Positioning Matrix</span>
              </div>
              <h1>Video Competitor Intelligence</h1>
              <p style={{ margin: "1rem 0 0", lineHeight: "1.7", color: "var(--muted)" }}>
                Discover performance metrics, publishing cadences, and content engagement ratios for any YouTube channel. Enter your brand and competitor names in the left sidebar to generate a client-ready strategic benchmarking dashboard.
              </p>
            </section>

            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
                <path d="M12 7v5" />
                <path d="M9 10h6" />
              </svg>
              <h3>No Channels Analyzed Yet</h3>
              <p>
                The dashboard is ready to render. Fill in the primary brand and up to four competitors on the left panel to begin. The intelligence engine will inspect video metadata, subscriber volumes, views-to-likes interaction, and deliver strategic recommendations.
              </p>

              <div className="empty-preview-grid">
                <div className="empty-preview-card">
                  <div className="card-icon">1</div>
                  <h4>Scoring comparison</h4>
                  <p>Weighted scoring metrics comparing scale, velocity, consistency, and content diversity.</p>
                </div>
                <div className="empty-preview-card">
                  <div className="card-icon">2</div>
                  <h4>Reach vs Engagement</h4>
                  <p>Scatter matrix separating high-scale channels from highly engaging niche brands.</p>
                </div>
                <div className="empty-preview-card">
                  <div className="card-icon">3</div>
                  <h4>Gap analysis</h4>
                  <p>Identifies content topics and cadence gaps that you can exploit for competitive advantage.</p>
                </div>
                <div className="empty-preview-card">
                  <div className="card-icon">4</div>
                  <h4>Executive findings</h4>
                  <p>Automatic content classification, channel health checks, and metadata confidence reports.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
