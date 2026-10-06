const CURRENCY_SYMBOLS: Record<string, string> = {
  DA: 'DZD', DZD: 'DZD', DINAR: 'DZD', DINARS: 'DZD',
  $: 'USD', USD: 'USD', 'US$': 'USD',
  '€': 'EUR', EUR: 'EUR',
  '£': 'GBP', GBP: 'GBP',
};

export const detectCurrency = (text: string): string | null => {
  const upper = text.toUpperCase();
  for (const [symbol, code] of Object.entries(CURRENCY_SYMBOLS)) {
    if (upper.includes(symbol)) return code;
  }
  return null;
};

export const normalizeNumber = (raw: string): number | null => {
  if (!raw) return null;
  let s = raw.trim().replace(/[€$£]/g, '').replace(/\s+/g, ' ');
  s = s.replace(/[^\d.,-]/g, '');
  if (!s || s === '-' || s === '.' || s === ',') return null;

  const hasDot = s.includes('.');
  const hasComma = s.includes(',');

  if (hasDot && hasComma) {
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) {
      s = s.replace(/\./g, '').replace(',', '.');
    } else {
      s = s.replace(/,/g, '');
    }
  } else if (hasComma) {
    const parts = s.split(',');
    if (parts.length === 2 && parts[1].length === 3) {
      s = parts.join('');
    } else {
      s = parts.join('.');
    }
  } else if (hasDot) {
    const parts = s.split('.');
    if (parts.length === 2 && parts[1].length === 3) {
      s = parts.join('');
    }
  }

  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
};

export const formatDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const parseDate = (raw: string): string | null => {
  if (!raw) return null;
  const s = raw.trim();

  let m = s.match(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return buildDate(+m[1], +m[2], +m[3]);

  m = s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return buildDate(+m[3], +m[2], +m[1]);

  m = s.match(/(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})\b/);
  if (m) {
    const year = 2000 + (+m[3] > 69 ? 1900 + +m[3] : 2000 + +m[3]);
    return buildDate(year, +m[2], +m[1]);
  }

  m = s.match(/(\d{1,2})\s*(janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre)\s*(\d{4})/i);
  if (m) {
    const months: Record<string, number> = {
      janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4, mai: 5,
      juin: 6, juillet: 7, août: 8, aout: 8, septembre: 9,
      octobre: 10, novembre: 11, décembre: 12, decembre: 12,
    };
    const month = months[m[2].toLowerCase()];
    if (month) return buildDate(+m[3], month, +m[1]);
  }

  return null;
};

const buildDate = (year: number, month: number, day: number): string | null => {
  if (month < 1 || month > 12 || day < 1 || day > 31 || year < 1900 || year > 2100) return null;
  const d = new Date(year, month - 1, day);
  if (d.getMonth() !== month - 1) return null;
  return formatDate(d);
};

export const normalizeText = (text: string): string =>
  text.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean).join('\n');
