export interface ParsedItem {
  description: string;
  quantity: number | null;
  unitPrice: number | null;
  total: number | null;
}

export interface FieldConfidence {
  vendorName: number;
  receiptDate: number;
  total: number;
  overall: number;
}

export interface ParsedReceipt {
  vendorName: string | null;
  receiptDate: string | null;
  total: number | null;
  tax: number | null;
  currency: string | null;
  paymentMethod: string | null;
  items: ParsedItem[];
  confidence: FieldConfidence;
}

export const emptyConfidence = (): FieldConfidence => ({
  vendorName: 0,
  receiptDate: 0,
  total: 0,
  overall: 0,
});
