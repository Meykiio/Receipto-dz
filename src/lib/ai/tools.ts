import { supabase } from '@/integrations/supabase/client';
import { searchReceiptChunks } from './embeddings';
import type { AiTool } from './provider';

const currentMonth = (): string => new Date().toISOString().slice(0, 7) + '-01';

const getUserId = async (): Promise<string> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
};

const queryReceipts = async (args: { vendor?: string; date_from?: string; date_to?: string; limit?: number }): Promise<string> => {
  const userId = await getUserId();
  let query = supabase
    .from('receipts')
    .select('id, vendor_name, receipt_date, total, currency')
    .eq('user_id', userId)
    .order('receipt_date', { ascending: false, nullsFirst: false })
    .limit(args.limit && args.limit > 0 && args.limit <= 20 ? args.limit : 10);

  if (args.vendor) query = query.ilike('vendor_name', `%${args.vendor}%`);
  if (args.date_from) query = query.gte('receipt_date', args.date_from);
  if (args.date_to) query = query.lte('receipt_date', args.date_to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return JSON.stringify(data ?? []);
};

const getSpendingSummary = async (args: { period?: 'week' | 'month' | 'quarter' | 'year' }): Promise<string> => {
  const userId = await getUserId();
  const period = args.period ?? 'month';
  const end = new Date();
  const start = new Date(end);
  if (period === 'week') start.setDate(end.getDate() - 7);
  else if (period === 'quarter') start.setMonth(end.getMonth() - 3);
  else if (period === 'year') start.setFullYear(end.getFullYear() - 1);
  else start.setMonth(end.getMonth() - 1);

  const { data, error } = await supabase
    .from('receipts')
    .select('vendor_name, total')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .gte('receipt_date', start.toISOString().slice(0, 10))
    .lte('receipt_date', end.toISOString().slice(0, 10));

  if (error) throw new Error(error.message);

  const receipts = data ?? [];
  const total = receipts.reduce((sum, r) => sum + (r.total ?? 0), 0);
  const byVendor = new Map<string, number>();
  for (const r of receipts) {
    byVendor.set(r.vendor_name, (byVendor.get(r.vendor_name) ?? 0) + (r.total ?? 0));
  }
  const topVendors = Array.from(byVendor.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return JSON.stringify({
    period,
    start: start.toISOString().slice(0, 10),
    end: end.toISOString().slice(0, 10),
    receiptCount: receipts.length,
    total,
    topVendors,
  });
};

const getInventory = async (args: { product?: string; low_stock_only?: boolean }): Promise<string> => {
  const userId = await getUserId();
  let query = supabase
    .from('inventory_stock')
    .select('product_id, name, quantity, low_stock_threshold, default_unit')
    .eq('user_id', userId);

  if (args.product) query = query.ilike('name', `%${args.product}%`);
  if (args.low_stock_only) {
    query = query.or(`quantity.lte.low_stock_threshold,quantity.lte.0`);
  }

  const { data, error } = await query.limit(20);
  if (error) throw new Error(error.message);
  return JSON.stringify(data ?? []);
};

const getBudgetStatus = async (): Promise<string> => {
  const userId = await getUserId();
  const month = currentMonth();
  const { data: budget, error } = await supabase
    .from('budgets')
    .select('amount, currency')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle();
  if (error) throw new Error(error.message);

  const { data: spentData, error: spentError } = await supabase
    .from('receipts')
    .select('total')
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .gte('receipt_date', month);
  if (spentError) throw new Error(spentError.message);

  const spent = (spentData ?? []).reduce((sum, r) => sum + (r.total ?? 0), 0);
  return JSON.stringify({ month, budget: budget?.amount ?? null, spent, currency: budget?.currency ?? 'DZD' });
};

type ToolHandler = (args: Record<string, unknown>) => Promise<string>;

export const aiTools: Array<AiTool & { handler: ToolHandler }> = [
  {
    name: 'query_receipts',
    description: 'Search the user\'s receipts by vendor, date range, and limit. Returns receipt rows.',
    parameters: {
      type: 'object',
      properties: {
        vendor: { type: 'string', description: 'Vendor name filter (case-insensitive substring)' },
        date_from: { type: 'string', description: 'Start date YYYY-MM-DD' },
        date_to: { type: 'string', description: 'End date YYYY-MM-DD' },
        limit: { type: 'number', description: 'Max rows (1-20, default 10)' },
      },
    },
    handler: (args) => queryReceipts(args as Parameters<typeof queryReceipts>[0]),
  },
  {
    name: 'get_spending_summary',
    description: 'Spending totals and top vendors for a period (week/month/quarter/year). Aggregated in SQL.',
    parameters: {
      type: 'object',
      properties: {
        period: { type: 'string', enum: ['week', 'month', 'quarter', 'year'], description: 'Time period' },
      },
    },
    handler: (args) => getSpendingSummary(args as Parameters<typeof getSpendingSummary>[0]),
  },
  {
    name: 'get_inventory',
    description: 'Current inventory stock levels, optionally filtered by product or low-stock only.',
    parameters: {
      type: 'object',
      properties: {
        product: { type: 'string', description: 'Product name filter (substring)' },
        low_stock_only: { type: 'boolean', description: 'Only products at or below their threshold' },
      },
    },
    handler: (args) => getInventory(args as Parameters<typeof getInventory>[0]),
  },
  {
    name: 'get_budget_status',
    description: 'Current month budget, amount spent, and currency.',
    parameters: { type: 'object', properties: {} },
    handler: () => getBudgetStatus(),
  },
  {
    name: 'search_receipts',
    description: 'Find receipts by meaning or fuzzy text (e.g. "that receipt where I bought headphones"). Returns matching receipt snippets.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'What to look for in plain words' },
        limit: { type: 'number', description: 'Max results (1-10, default 5)' },
      },
      required: ['query'],
    },
    handler: async (args) => {
      const query = String(args.query ?? '');
      const limit = typeof args.limit === 'number' ? args.limit : 5;
      const results = await searchReceiptChunks(query, limit);
      return JSON.stringify(results);
    },
  },
];

export const toolSchemas = aiTools.map(({ handler: _handler, ...tool }) => tool);
export const toolHandlers = new Map(aiTools.map((tool) => [tool.name, tool.handler]));