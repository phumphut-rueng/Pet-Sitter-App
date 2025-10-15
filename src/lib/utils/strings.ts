export function sanitizeDigits(value?: string | null): string | undefined {
  const digits = (value ?? "").replace(/\D/g, "");
  return digits || undefined;
}

export function trimString(value?: string | null): string {
  return (value ?? "").trim();
}

/**
 * แปลง date string เป็น YYYY-MM-DD format
 * รองรับทั้ง DD/MM/YYYY และ YYYY/MM/DD
 */
export function toYmd(input?: string | null): string | undefined {
  if (!input) return undefined;
  
  const s = input.trim();
  const ddmmyyyy = /^(\d{2})[\/-](\d{2})[\/-](\d{4})$/;
  const yyyymmdd = /^(\d{4})[\/-](\d{2})[\/-](\d{2})$/;
  
  if (ddmmyyyy.test(s)) {
    const [, dd, mm, yyyy] = s.match(ddmmyyyy)!;
    return `${yyyy}-${mm}-${dd}`;
  }
  
  if (yyyymmdd.test(s)) {
    const [, yyyy, mm, dd] = s.match(yyyymmdd)!;
    return `${yyyy}-${mm}-${dd}`;
  }
  
  return undefined;
}