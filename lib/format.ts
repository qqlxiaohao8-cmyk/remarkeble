const CN = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

export function chineseCount(value: number) {
  if (value <= 10) return CN[value] ?? String(value);
  if (value < 20) return `十${CN[value - 10]}`;
  if (value === 20) return "二十";
  return String(value);
}

export function folio(value: number) {
  return String(value).padStart(2, "0");
}

export function paragraphs(story: string) {
  return story
    .split(/\n\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function slugify(value: string) {
  const slug = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "entry";
}

export function formatClock(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remain = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remain).padStart(2, "0")}`;
}

export function parseDuration(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return 180;
  return Number(match[1]) * 60 + Number(match[2]);
}

export function normalizeDuration(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return "03:00";
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}
