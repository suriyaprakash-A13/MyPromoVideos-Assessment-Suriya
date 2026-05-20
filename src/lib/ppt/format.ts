import { VideoMetric } from "@/lib/types";

export function fmtNumber(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en").format(Math.round(value));
}

export function fmtCompact(value?: number): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
}

export function fmtPct(value?: number, digits = 1): string {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return "n/a";
  }

  return `${value.toFixed(digits)}%`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, Math.max(0, maxLength - 3)).trim()}...`;
}

/** Rough chars per inch at body font size for truncation heuristics. */
export function maxCharsForWidth(widthInches: number, charsPerInch = 14): number {
  return Math.max(12, Math.floor(widthInches * charsPerInch));
}

export function videoEngagement(video: VideoMetric): number {
  if (!video.views || video.views <= 0) {
    return 0;
  }

  return (((video.likes ?? 0) + (video.comments ?? 0)) / video.views) * 100;
}

export function bulletLines(lines: string[], maxLines: number): string {
  return lines.slice(0, maxLines).join("\n");
}
