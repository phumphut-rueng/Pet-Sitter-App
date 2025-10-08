export const sanitize = {
    onlyDigits: (value?: string | null): string | undefined => {
      const digits = (value ?? "").replace(/\D/g, "");
      return digits || undefined;
    },
    trimString: (value?: string | null): string => (value ?? "").trim(),
  };
  
  export const formatDate = {
    toYmd: (input?: string | null): string | undefined => {
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
    },
  };
  
  export function toErrorMessage(e: unknown, fallback = "Unknown error") {
    if (e instanceof Error) return e.message;
    if (typeof e === "string") return e;
    try { return JSON.stringify(e); } catch { return fallback; }
  }