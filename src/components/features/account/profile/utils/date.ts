export const toYmd = (date?: Date): string =>
    date
      ? new Date(date.getTime() - date.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 10)
      : "";
  
  export const parseYmd = (str?: string): Date | undefined => {
    if (!str) return undefined;
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str.trim());
    if (!match) return undefined;
    
    const [, yyyy, mm, dd] = match;
    const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return Number.isNaN(date.getTime()) ? undefined : date;
  };
  
  export const sameMonth = (a?: Date, b?: Date): boolean =>
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth();
  
  export const clampDay = (year: number, month: number, day: number): number =>
    Math.min(day, new Date(year, month + 1, 0).getDate());