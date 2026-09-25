export function formatDate(
  date: string,
  withTime: boolean = false,
  withDay: boolean = false,
): string {
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime ? { weekday: 'short' } : {}),
    ...(withDay ? { hour: 'numeric', minute: '2-digit', hour12: false } : {}),
  });
}

export function formatTime(date: string): string {
  return new Date(date).toLocaleTimeString('en-PH', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export type ParsedDateRange = {
  type: 'single' | 'month' | 'year' | 'invalid';
  startDate?: string; // ISO
  endDate?: string; // ISO
};

/**
 * parseDateInput accepts inputs like:
 * - "sep" -> whole month of current year (Sep currentYear)
 * - "sep 2" -> day 2 of current year
 * - "sep 2, 2026" -> specific date
 * - "sep 2026" -> whole month of Sep 2026
 *
 * Returns an object with type and ISO start/end dates when applicable.
 */
export function parseDateInput(input: string): ParsedDateRange {
  if (!input || typeof input !== 'string') return { type: 'invalid' };
  const now = new Date();
  const parts = input.trim().toLowerCase();

  // Normalize commas/periods and split; strip punctuation from tokens
  const cleaned = parts.replace(/[.,]\s*/g, ' ');
  const tokens = cleaned
    .split(/\s+/)
    .map((t) => t.replace(/[.,]/g, '').trim())
    .filter(Boolean);
  if (tokens.length === 0) return { type: 'invalid' };

  const monthNames: { [k: string]: number } = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    sept: 8,
    oct: 9,
    nov: 10,
    dec: 11,
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    // may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };

  const monthToken = tokens[0];
  const monthIdx = monthNames[monthToken];
  if (monthIdx === undefined) return { type: 'invalid' };

  // Helper to build ISO date strings at start/end of day in local timezone
  const makeISO = (y: number, m: number, d: number) => {
    const dt = new Date(y, m, d);
    return dt.toISOString();
  };

  if (tokens.length === 1) {
    // "sep" => whole month of current year
    const year = now.getFullYear();
    const start = makeISO(year, monthIdx, 1);
    const end = makeISO(year, monthIdx + 1, 0); // last day of month
    return { type: 'month', startDate: start, endDate: end };
  }

  const second = tokens[1];

  if (tokens.length === 2) {
    // allow day ordinals like "2nd" or pure numbers; treat 4-digit as year
    const numeric = parseInt(second.replace(/[^0-9]/g, ''), 10);
    if (!Number.isNaN(numeric)) {
      if (numeric >= 1000) {
        // assume year: "sep 2026"
        const year = numeric;
        const start = makeISO(year, monthIdx, 1);
        const end = makeISO(year, monthIdx + 1, 0);
        return { type: 'month', startDate: start, endDate: end };
      }
      // assume day of current year: "sep 2" or "sep 2nd"
      const year = now.getFullYear();
      const day = numeric;
      if (day >= 1 && day <= 31) {
        const start = makeISO(year, monthIdx, day);
        return { type: 'single', startDate: start };
      }
    }
  }

  // tokens length >= 3: assume month day year (e.g., "sep 2 2026")
  if (tokens.length >= 3) {
    const day = parseInt(tokens[1].replace(/[^0-9]/g, ''), 10);
    const year = parseInt(tokens[2].replace(/[^0-9]/g, ''), 10);
    if (!Number.isNaN(day) && !Number.isNaN(year)) {
      const start = makeISO(year, monthIdx, day);
      return { type: 'single', startDate: start };
    }
  }

  return { type: 'invalid' };
}
