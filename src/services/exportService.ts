import { zipSync, strToU8 } from "fflate";
import type { Receipt } from "@/types";

/**
 * Receipt export to CSV / Excel / JSON.
 *
 * Generates the spreadsheet files directly (CSV + a minimal, valid .xlsx
 * built from SpreadsheetML inside a zip) so the heavy, unmaintained `xlsx`
 * package — which carries open ReDoS/prototype-pollution advisories with no
 * npm fix — is not part of the app. The xlsx advisories only affect parsing
 * untrusted files, but shipping zero vulnerable runtime deps is the safer
 * public default.
 */

type ExportRow = {
  receiptId: string;
  vendor: string;
  receiptDate: string;
  currency: string;
  total: number;
  tax: number;
  paymentMethod: string;
  itemCount: number;
  items: string;
};

const buildRows = (receipts: Receipt[], currency?: string): ExportRow[] =>
  receipts.map((receipt) => ({
    receiptId: receipt.id,
    vendor: receipt.vendorName || "Unknown",
    receiptDate: receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : "N/A",
    currency: receipt.currency || currency || "DZD",
    total: receipt.total || 0,
    tax: receipt.tax || 0,
    paymentMethod: receipt.paymentMethod || "N/A",
    itemCount: receipt.items?.length || 0,
    items: (receipt.items || [])
      .map((item) => `${item.quantity ?? 0}x ${item.description ?? ""}`)
      .join("; "),
  }));

const COLUMNS: Array<[keyof ExportRow, string]> = [
  ["receiptId", "Receipt ID"],
  ["vendor", "Vendor"],
  ["receiptDate", "Receipt Date"],
  ["currency", "Currency"],
  ["total", "Total"],
  ["tax", "Tax"],
  ["paymentMethod", "Payment Method"],
  ["itemCount", "Item Count"],
  ["items", "Items"],
];

const csvEscape = (value: string | number): string => {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const download = (blob: Blob, filename: string): void => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const toCsv = (rows: ExportRow[]): string => {
  const header = COLUMNS.map(([, label]) => label).join(",");
  const body = rows.map((row) =>
    COLUMNS.map(([key]) => csvEscape(row[key])).join(",")
  );
  return "\uFEFF" + [header, ...body].join("\n");
};

// Minimal but valid XLSX: one sheet, plain strings/numbers, no shared strings
// table needed for this simple shape (inline strings are allowed).
const toXlsx = (rows: ExportRow[]): Uint8Array => {
  const escapeXml = (value: string | number): string =>
    String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const cell = (value: string | number): string => {
    const isNumeric = typeof value === "number" || /^-?\d+(\.\d+)?$/.test(String(value));
    if (isNumeric) return `<c><v>${escapeXml(value)}</v></c>`;
    return `<c t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
  };

  const headerRow = `<row>${COLUMNS.map(([, label]) => cell(label)).join("")}</row>`;
  const dataRows = rows
    .map((row) => `<row>${COLUMNS.map(([key]) => cell(row[key])).join("")}</row>`)
    .join("");

  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${headerRow}${dataRows}</sheetData></worksheet>`;
  const workbook = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Receipts" sheetId="1" r:id="rId1"/></sheets></workbook>`;
  const rels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
  const wbRels = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
  const contentType = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;

  return zipSync({
    "[Content_Types].xml": strToU8(contentType),
    "_rels/.rels": strToU8(rels),
    "xl/workbook.xml": strToU8(workbook),
    "xl/_rels/workbook.xml.rels": strToU8(wbRels),
    "xl/worksheets/sheet1.xml": strToU8(sheet),
  });
};

export const exportReceipts = (
  format: "csv" | "excel" | "json",
  receipts: Receipt[],
  currency?: string
): string => {
  const rows = buildRows(receipts, currency);

  if (format === "json") {
    const blob = new Blob([JSON.stringify(rows, null, 2)], { type: "application/json" });
    download(blob, "receipts_export.json");
    return "json";
  }

  if (format === "csv") {
    download(new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" }), "receipts_export.csv");
    return "csv";
  }

  const bytes = toXlsx(rows);
  const blob = new Blob([bytes as BlobPart], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  download(blob, "receipts_export.xlsx");
  return "excel";
};