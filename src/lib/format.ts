const DAYS_PT = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MONTHS_PT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTHS_FULL_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function todayInFortaleza(): Date {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Fortaleza",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = fmt.format(new Date()).split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatBRL(n: number): string {
  const neg = n < 0;
  const abs = Math.abs(n);
  const s = abs.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return (neg ? "−" : "") + "R$ " + s;
}

export function formatBRLSigned(n: number, tipo: "entrada" | "saida"): string {
  const abs = Math.abs(n);
  const s = abs.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = tipo === "entrada" ? "+ " : "− ";
  return sign + "R$ " + s;
}

export function formatDateShort(iso: string): string {
  const d = parseDate(iso);
  return `${DAYS_PT[d.getDay()]}, ${d.getDate()} ${MONTHS_PT[d.getMonth()]}`;
}

export function formatDateLong(iso: string): string {
  const d = parseDate(iso);
  return `${d.getDate()} DE ${MONTHS_FULL_PT[d.getMonth()].toUpperCase()} DE ${d.getFullYear()}`;
}

export function daysBetween(iso: string, from: Date = todayInFortaleza()): number {
  const d = parseDate(iso);
  return Math.round((d.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatRelative(iso: string, from?: Date): string {
  const diff = daysBetween(iso, from);
  if (diff === 0) return "HOJE";
  if (diff === -1) return "ONTEM";
  if (diff > 0) {
    if (diff === 1) return "AMANHÃ";
    if (diff < 7) return `EM ${diff} DIAS`;
    const weeks = Math.floor(diff / 7);
    return weeks === 1 ? "EM 1 SEMANA" : `EM ${weeks} SEMANAS`;
  }
  const a = -diff;
  if (a < 7) return a === 1 ? "ONTEM" : `HÁ ${a} DIAS`;
  const weeks = Math.floor(a / 7);
  return weeks === 1 ? "HÁ 1 SEMANA" : `HÁ ${weeks} SEMANAS`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function isColorLight(hex: string): boolean {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b > 140;
}

export function normalizePhone(s: string | null | undefined): string {
  return (s || "").replace(/\D/g, "");
}

export function maskPhone(s: string | null | undefined): string {
  const n = normalizePhone(s);
  if (!n) return "";
  return "••••" + n.slice(-4);
}

export function nextFridayISO(from: Date = todayInFortaleza()): string {
  const d = new Date(from);
  let add = (5 - d.getDay() + 7) % 7;
  if (add === 0) add = 7;
  d.setDate(d.getDate() + add);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

export const POS_COLORS: Record<"GOL" | "DEF" | "MEI" | "ATA", string> = {
  GOL: "#FFA64D",
  DEF: "#4D8BFF",
  MEI: "#E8FF4D",
  ATA: "#FF4D8B",
};

export function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}
