import dayjs from "dayjs";

export function parseVideoDate(dateText?: string): dayjs.Dayjs | undefined {
  if (!dateText) {
    return undefined;
  }

  const direct = dayjs(dateText);
  if (direct.isValid() && /^\d{4}-\d{2}-\d{2}/.test(dateText.trim())) {
    return direct;
  }

  const relative = dateText.toLowerCase();
  const match = relative.match(/(\d+)\s+(day|week|month|year|hour|minute|min)/);

  if (!match) {
    return undefined;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  if (unit.startsWith("hour") || unit.startsWith("min")) {
    return dayjs().subtract(amount, unit.startsWith("hour") ? "hour" : "minute");
  }
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

/** True when publishedAt is ISO-like and includes time (YouTube API). */
export function hasPublishHour(dateText?: string): boolean {
  if (!dateText) {
    return false;
  }
  const trimmed = dateText.trim();
  if (!/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
    return false;
  }
  const parsed = dayjs(trimmed);
  return parsed.isValid() && (parsed.hour() !== 0 || trimmed.includes(":"));
}
