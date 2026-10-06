/**
 * Minimal translate function shape, so report helpers stay decoupled from
 * react-i18next and can be reused with any translator.
 */
export type Translate = (key: string, options?: Record<string, unknown>) => string;

export interface SpendingData {
  date: string;
  value: number;
}

export interface SpendingByVendorData {
  name: string;
  value: number;
}

export interface InsightsSummary {
  totalSpent: number;
  averagePerReceipt: number;
  topCategory: string | null;
  topVendor: string | null;
  totalReceipts: number;
}

export interface InsightsReportProps {
  isOpen: boolean;
  onClose: () => void;
  summary: InsightsSummary;
  spendingData: SpendingData[];
  vendorData: SpendingByVendorData[];
  dateRange: string;
  currency: string;
  dateSource?: string;
}