import { normalizeNumber, parseDate, detectCurrency } from './normalize';
import type { ParsedReceipt, ParsedItem } from './types';

const TOTAL_KEYWORDS = /\b(total\s*(a\s*payer|apayer|ttc|general|général|final)?|net\s*a\s*payer|montant\s*(ttc|total)?|a\s*payer|à\s*payer|net\s*a\s*payer|total)\b/i;
const TAX_KEYWORDS = /\b(tva|tax|taxe|timbre)\b/i;
const PAYMENT_KEYWORDS: Array<[RegExp, string]> = [
  [/carte\s*(bancaire|bleue|cb)|cb|visa|mastercard|carte/i, 'Card'],
  [/esp[èe]ces|cash|liquide/i, 'Cash'],
  [/ch[èe]que|cheque/i, 'Check'],
  [/virement|transfer/i, 'Transfer'],
];

// OCR often confuses 0/O, 1/I, 5/S, 8/B. Keyword matching runs against both
// the raw line and a confusion-tolerant variant so "T0tal" still matches.
const ocrTolerant = (line: string): string =>
  line.replace(/0/g, 'O').replace(/1/g, 'I').replace(/5/g, 'S').replace(/8/g, 'B');

const matchesKeyword = (line: string, pattern: RegExp): boolean =>
  pattern.test(line) || pattern.test(ocrTolerant(line));

const isNoiseLine = (line: string): boolean => {
  if (line.length < 2) return true;
  if (/^[\d\s.,:;|\-_/]+$/.test(line)) return true;
  if (/^(tel|tél|telephone|fax|rc|nif|ice|adresse|date|heure)\s*:/i.test(line)) return true;
  return false;
};

const looksLikeItemLine = (line: string): boolean => {
  const numbers = (line.match(/\d+[.,]\d{2}/g) ?? []).length;
  const hasQty = /\d+\s*(x|×|@|\*)\s*\d+/i.test(line) || /^\s*\d+\s+\S/.test(line);
  return (numbers >= 1 && line.length > 6 && !matchesKeyword(line, TOTAL_KEYWORDS)) || hasQty;
};

const parseItemLine = (line: string): ParsedItem | null => {
  // A leading number in the description is almost always a duplicated
  // quantity prefix (receipts print "1 Pain complet ... 1 x 50,00").
  const stripQtyPrefix = (desc: string): string =>
    desc.trim().replace(/^\d+(?:[.,]\d+)?\s+/, '');

  let m = line.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s*(?:x|×|@|\*)\s*(\d+[.,]\d{2})\s+(\d+[.,]\d{2})\s*$/i);
  if (m) {
    return {
      description: stripQtyPrefix(m[1]),
      quantity: normalizeNumber(m[2]),
      unitPrice: normalizeNumber(m[3]),
      total: normalizeNumber(m[4]),
    };
  }

  m = line.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(\d+[.,]\d{2})\s+(\d+[.,]\d{2})\s*$/);
  if (m) {
    const qty = normalizeNumber(m[2]);
    const unit = normalizeNumber(m[3]);
    const total = normalizeNumber(m[4]);
    if (qty !== null && unit !== null && total !== null && Math.abs(qty * unit - total) < 0.05) {
      return { description: stripQtyPrefix(m[1]), quantity: qty, unitPrice: unit, total };
    }
  }

  m = line.match(/^(.+?)\s+(\d+[.,]\d{2})\s*$/);
  if (m) {
    const total = normalizeNumber(m[2]);
    if (total !== null) {
      return { description: stripQtyPrefix(m[1]), quantity: 1, unitPrice: total, total };
    }
  }

  return null;
};

export const parseReceiptText = (text: string): ParsedReceipt => {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  let vendorName: string | null = null;
  let vendorConfidence = 0;
  for (const line of lines.slice(0, 6)) {
    if (isNoiseLine(line)) continue;
    if (parseDate(line) && line.replace(/[\d\s./-]/g, '').length < 4) continue;
    vendorName = line;
    vendorConfidence = lines.indexOf(line) === 0 ? 0.9 : 0.6;
    break;
  }

  let receiptDate: string | null = null;
  let dateConfidence = 0;
  for (const line of lines) {
    const d = parseDate(line);
    if (d) {
      receiptDate = d;
      dateConfidence = 0.85;
      break;
    }
  }

  let total: number | null = null;
  let totalConfidence = 0;
  const totalCandidates: number[] = [];
  for (const line of lines) {
    if (!matchesKeyword(line, TOTAL_KEYWORDS)) continue;
    const nums = [...line.matchAll(/\d+(?:[.,]\d{3})*(?:[.,]\d{2})?(?!\d)(?!%)/g)].map((m) => normalizeNumber(m[0]));
    const valid = nums.filter((n): n is number => n !== null && n > 0);
    if (valid.length > 0) {
      totalCandidates.push(Math.max(...valid));
    }
  }
  if (totalCandidates.length > 0) {
    total = Math.max(...totalCandidates);
    totalConfidence = totalCandidates.length > 1 ? 0.95 : 0.8;
  } else {
    const allNums = [...text.matchAll(/\d+(?:[.,]\d{3})*(?:[.,]\d{2})?(?!\d)(?!%)/g)]
      .map((m) => normalizeNumber(m[0]))
      .filter((n): n is number => n !== null && n > 1);
    if (allNums.length > 0) {
      total = Math.max(...allNums);
      totalConfidence = 0.4;
    }
  }

  let tax: number | null = null;
  for (const line of lines) {
    if (!matchesKeyword(line, TAX_KEYWORDS)) continue;
    const nums = [...line.matchAll(/\d+(?:[.,]\d{3})*(?:[.,]\d{2})?(?!\d)(?!%)/g)].map((m) => normalizeNumber(m[0]));
    const valid = nums.filter((n): n is number => n !== null && n > 0);
    if (valid.length > 0) {
      tax = valid[0];
      break;
    }
  }

  const currency = detectCurrency(text);

  let paymentMethod: string | null = null;
  for (const [pattern, label] of PAYMENT_KEYWORDS) {
    if (pattern.test(text) || pattern.test(ocrTolerant(text))) {
      paymentMethod = label;
      break;
    }
  }

  const items: ParsedItem[] = [];
  for (const line of lines) {
    if (matchesKeyword(line, TOTAL_KEYWORDS) || matchesKeyword(line, TAX_KEYWORDS)) continue;
    if (!looksLikeItemLine(line)) continue;
    const item = parseItemLine(line);
    if (item && item.description) items.push(item);
  }

  const overall = Math.round(
    (vendorConfidence * 0.25 + dateConfidence * 0.2 + totalConfidence * 0.45 + (items.length > 0 ? 0.1 : 0)) * 100
  ) / 100;

  return {
    vendorName,
    receiptDate,
    total,
    tax,
    currency,
    paymentMethod,
    items,
    confidence: {
      vendorName: vendorConfidence,
      receiptDate: dateConfidence,
      total: totalConfidence,
      overall,
    },
  };
};
