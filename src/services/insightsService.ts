import { supabase } from "@/integrations/supabase/client";

export interface SpendingByCategory {
  category: string;
  amount: number;
}

export interface SpendingByVendor {
  vendor: string;
  amount: number;
}

export interface SpendingTrend {
  date: string;
  amount: number;
}

export interface InsightsData {
  totalSpent: number;
  averageSpending: number;
  spendingByCategory: SpendingByCategory[];
  spendingByVendor: SpendingByVendor[];
  spendingTrends: SpendingTrend[];
  receiptCount: number;
}

const formatDate = (date: Date): string => date.toISOString().split("T")[0];

export const getDateRangeForPeriod = (period: string): { startDate: Date; endDate: Date } => {
  const endDate = new Date();
  const startDate = new Date(endDate);

  switch (period) {
    case "week":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "quarter":
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case "year":
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
    case "month":
    default:
      startDate.setMonth(endDate.getMonth() - 1);
      break;
  }

  return { startDate, endDate };
};

const resolveReceiptDate = (row: { receipt_date: string | null; created_at: string }): string => {
  return row.receipt_date ?? row.created_at.split("T")[0];
};

export const getInsightsData = async (
  period: string = "month",
  startDateOverride?: Date,
  endDateOverride?: Date
): Promise<InsightsData> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("User not authenticated");

  const { data: dbReceipts, error } = await supabase
    .from("receipts")
    .select("id, vendor_name, receipt_date, created_at, total, status")
    .eq("user_id", user.id)
    .eq("status", "confirmed")
    .order("receipt_date", { ascending: false, nullsFirst: false });

  if (error) throw new Error(`Failed to fetch receipts: ${error.message}`);

  const receipts = dbReceipts ?? [];
  if (receipts.length === 0) {
    return {
      totalSpent: 0,
      averageSpending: 0,
      spendingByCategory: [],
      spendingByVendor: [],
      spendingTrends: [],
      receiptCount: 0,
    };
  }

  const { startDate, endDate } = startDateOverride && endDateOverride
    ? { startDate: startDateOverride, endDate: endDateOverride }
    : getDateRangeForPeriod(period);

  const inRange = receipts.filter((r) => {
    const date = new Date(resolveReceiptDate(r));
    return date >= startDate && date <= endDate;
  });

  const source = inRange.length > 0 ? inRange : receipts;

  const { data: dbItems, error: itemsError } = await supabase
    .from("receipt_items")
    .select("receipt_id, description, quantity, unit_price, damaged_quantity")
    .eq("user_id", user.id);

  if (itemsError) throw new Error(`Failed to fetch receipt items: ${itemsError.message}`);

  const itemsByReceipt = new Map<string, typeof dbItems>();
  for (const item of dbItems ?? []) {
    const list = itemsByReceipt.get(item.receipt_id) ?? [];
    list.push(item);
    itemsByReceipt.set(item.receipt_id, list);
  }

  const vendorMap = new Map<string, number>();
  const categoryMap = new Map<string, number>();
  const dateMap = new Map<string, number>();

  const cursor = new Date(startDate);
  while (cursor <= endDate) {
    dateMap.set(formatDate(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  let totalSpent = 0;

  for (const receipt of source) {
    const items = itemsByReceipt.get(receipt.id) ?? [];
    const receiptTotal = items.reduce((sum, item) => {
      const effectiveQty = Math.max(item.quantity - item.damaged_quantity, 0);
      return sum + effectiveQty * item.unit_price;
    }, 0);

    totalSpent += receiptTotal;
    vendorMap.set(receipt.vendor_name, (vendorMap.get(receipt.vendor_name) ?? 0) + receiptTotal);

    const day = formatDate(new Date(resolveReceiptDate(receipt)));
    if (dateMap.has(day)) {
      dateMap.set(day, (dateMap.get(day) ?? 0) + receiptTotal);
    }

    for (const item of items) {
      const category = categorizeItem(item.description);
      const effectiveQty = Math.max(item.quantity - item.damaged_quantity, 0);
      categoryMap.set(category, (categoryMap.get(category) ?? 0) + effectiveQty * item.unit_price);
    }
  }

  const receiptCount = source.length;

  return {
    totalSpent,
    averageSpending: receiptCount > 0 ? totalSpent / receiptCount : 0,
    spendingByCategory: Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount),
    spendingByVendor: Array.from(vendorMap.entries())
      .map(([vendor, amount]) => ({ vendor, amount }))
      .sort((a, b) => b.amount - a.amount),
    spendingTrends: Array.from(dateMap.entries())
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    receiptCount,
  };
};

const CATEGORY_RULES: Array<{ category: string; patterns: RegExp }> = [
  { category: "Food & Beverages", patterns: /food|drink|beverage|juice|water|bread|pain|croissant|cafe|coffee|the|tea|fromage|cheese|viande|meat|poisson|fish|lait|milk|yaourt|yogurt|fruit|légume|vegetable|epice|spice|riz|pasta|pizza|sandwich|burger/i },
  { category: "Electronics", patterns: /electronics|tech|phone|telephone|charge|cable|ecouteur|headphone|batterie|battery|ecran|screen|clavier|keyboard|souris|mouse|tv|television|pc|laptop/i },
  { category: "Clothing", patterns: /clothes|apparel|shoes|chaussure|t-shirt|chemise|pantalon|pants|robe|dress|veste|jacket|pull|sweater|jean|short/i },
  { category: "Household", patterns: /household|maison|clean|nettoyage|lessive|detergent|savon|soap|serviette|tissue|poubelle|trash|lampe|light|outil|tool/i },
  { category: "Health & Beauty", patterns: /sante|health|beauty|beaute|parfum|perfume|creme|cream|shampooing|shampoo|brosse|brush|medicament|medication|pharmacie|pharmacy/i },
  { category: "Transport", patterns: /transport|carburant|fuel|essence|diesel|taxi|bus|train|metro|parking|park|vidange|oil|pneu|tire/i },
];

const categorizeItem = (description: string): string => {
  for (const rule of CATEGORY_RULES) {
    if (rule.patterns.test(description)) return rule.category;
  }
  return "Miscellaneous";
};
