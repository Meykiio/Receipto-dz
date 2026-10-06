import { describe, it, expect } from 'vitest';
import { normalizeNumber, parseDate, detectCurrency } from '../normalize';
import { parseReceiptText } from '../extract';
import { SUPERMARKET_RECEIPT, NUMERIC_RECEIPT, MESSY_OCR_RECEIPT } from './fixtures/receipts';

describe('normalizeNumber', () => {
  it('parses Algerian/French format 1.234,56', () => {
    expect(normalizeNumber('1.234,56')).toBe(1234.56);
  });

  it('parses space-separated thousands 1 234,56', () => {
    expect(normalizeNumber('1 234,56')).toBe(1234.56);
  });

  it('parses dot decimals 1234.56', () => {
    expect(normalizeNumber('1234.56')).toBe(1234.56);
  });

  it('parses comma decimals 12,50', () => {
    expect(normalizeNumber('12,50')).toBe(12.5);
  });

  it('parses dot thousands 1.234', () => {
    expect(normalizeNumber('1.234')).toBe(1234);
  });

  it('strips currency symbols', () => {
    expect(normalizeNumber('1.618,40 DA')).toBe(1618.4);
  });

  it('returns null for garbage', () => {
    expect(normalizeNumber('abc')).toBeNull();
    expect(normalizeNumber('')).toBeNull();
    expect(normalizeNumber('...')).toBeNull();
  });
});

describe('parseDate', () => {
  it('parses DD/MM/YYYY', () => {
    expect(parseDate('12/03/2024')).toBe('2024-03-12');
  });

  it('parses YYYY-MM-DD', () => {
    expect(parseDate('2024-03-15')).toBe('2024-03-15');
  });

  it('parses French text dates', () => {
    expect(parseDate('12 mars 2024')).toBe('2024-03-12');
  });

  it('returns null for invalid dates', () => {
    expect(parseDate('not a date')).toBeNull();
    expect(parseDate('32/13/2024')).toBeNull();
  });
});

describe('detectCurrency', () => {
  it('detects Algerian Dinar', () => {
    expect(detectCurrency('TOTAL 100 DA')).toBe('DZD');
  });

  it('detects Euro', () => {
    expect(detectCurrency('TOTAL 10 €')).toBe('EUR');
  });

  it('detects USD', () => {
    expect(detectCurrency('TOTAL $10')).toBe('USD');
  });

  it('returns null when unknown', () => {
    expect(detectCurrency('TOTAL 100')).toBeNull();
  });
});

describe('parseReceiptText', () => {
  it('parses a French Algerian supermarket receipt', () => {
    const result = parseReceiptText(SUPERMARKET_RECEIPT);

    expect(result.vendorName).toBe('SARL MARKET PLUS');
    expect(result.receiptDate).toBe('2024-03-12');
    expect(result.total).toBe(1618.4);
    expect(result.tax).toBe(258.4);
    expect(result.currency).toBe('DZD');
    expect(result.paymentMethod).toBe('Card');
    expect(result.items.length).toBe(5);
    expect(result.items[0]).toEqual({
      description: 'Pain complet',
      quantity: 1,
      unitPrice: 50,
      total: 50,
    });
    expect(result.confidence.overall).toBeGreaterThan(0.7);
  });

  it('parses a minimal numeric receipt', () => {
    const result = parseReceiptText(NUMERIC_RECEIPT);

    expect(result.receiptDate).toBe('2024-03-15');
    expect(result.total).toBe(425.5);
    expect(result.paymentMethod).toBe('Cash');
    expect(result.confidence.total).toBeGreaterThan(0.5);
  });

  it('handles messy OCR text with a typo in TOTAL', () => {
    const result = parseReceiptText(MESSY_OCR_RECEIPT);

    expect(result.vendorName).toBe('CAFÉ CENTRAL');
    expect(result.receiptDate).toBe('2024-04-01');
    expect(result.total).toBe(230);
    expect(result.currency).toBe('DZD');
    expect(result.paymentMethod).toBe('Cash');
  });

  it('returns low confidence for empty text', () => {
    const result = parseReceiptText('');

    expect(result.vendorName).toBeNull();
    expect(result.total).toBeNull();
    expect(result.confidence.overall).toBe(0);
  });
});
