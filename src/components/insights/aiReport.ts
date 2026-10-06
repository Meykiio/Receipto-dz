import { getAiSettings, getStoredApiKey } from '@/services/aiSettingsService';
import { chatCompletion } from '@/lib/ai/provider';
import { formatCurrency } from '@/lib/utils';
import i18n from '@/i18n';
import type {
  InsightsSummary,
  SpendingByVendorData,
  SpendingData,
  Translate,
} from './reportTypes';

export interface AiReportParams {
  summary: InsightsSummary;
  spendingData: SpendingData[];
  vendorData: SpendingByVendorData[];
  dateRange: string;
  currency: string;
}

export const buildNoReceiptsReport = (dateRange: string, t: Translate): string =>
  t('insightsReport.noReceiptsReportTemplate', { days: dateRange });

/**
 * Deterministic report used when the AI provider returns no content, so the user
 * still gets a useful analysis instead of an empty panel.
 */
export const buildFallbackReport = (
  { summary, spendingData, vendorData, dateRange, currency }: AiReportParams,
  t: Translate,
): string => {
  const totalSpent = summary.totalSpent;
  const totalReceipts = summary.totalReceipts;
  const topVendor = summary.topVendor || t('insightsReport.notAvailable');
  const topCategory = summary.topCategory || t('insightsReport.notAvailable');

  const nonZeroSpending = [...spendingData].filter(item => item.value > 0);
  const sortedSpending = nonZeroSpending.sort((a, b) => b.value - a.value);
  const highestDay = sortedSpending[0];
  const lowestDay = sortedSpending[sortedSpending.length - 1];

  const daysWithSpending = nonZeroSpending.length;
  const avgDaily = daysWithSpending > 0 ? totalSpent / daysWithSpending : 0;

  const spendingDays = nonZeroSpending.length;
  const totalDays = parseInt(dateRange);
  const spendingFrequency = totalDays > 0 ? (spendingDays / totalDays) * 100 : 0;

  const avgTransaction = totalReceipts > 0 ? totalSpent / totalReceipts : 0;

  const dateWithAmount = (item?: { date: string; value: number }) =>
    item
      ? `${new Date(item.date).toLocaleDateString()} (${formatCurrency(item.value, currency)})`
      : t('insightsReport.notAvailable');

  const trendKey =
    sortedSpending.length < 3
      ? 'insightsReport.trendStable'
      : sortedSpending[0].value > sortedSpending[sortedSpending.length - 1].value
        ? 'insightsReport.trendIncreasing'
        : 'insightsReport.trendDecreasing';

  const patternKey =
    spendingFrequency < 30
      ? 'insightsReport.patternInfrequent'
      : spendingFrequency > 70
        ? 'insightsReport.patternRegular'
        : 'insightsReport.patternModerate';

  const patternAdvice =
    spendingFrequency < 50
      ? 'insightsReport.patternAdviceSpread'
      : 'insightsReport.patternAdviceSteady';

  const magnitudeKey = totalSpent > 1000 ? 'insightsReport.magnitudeSignificant' : 'insightsReport.magnitudeModerate';
  const frequencyKey = spendingFrequency > 60 ? 'insightsReport.frequencyRegular' : 'insightsReport.frequencyIrregular';

  const otherVendors = vendorData.slice(1, 3);
  const vendorOthers =
    otherVendors.length > 0
      ? `, ${otherVendors
          .map(v => `${v.name} (${Math.round((v.value / Math.max(totalSpent, 1)) * 100)}%)`)
          .join(', ')}`
      : '';

  return t('insightsReport.fallbackReportTemplate', {
    days: dateRange,
    totalSpent: formatCurrency(totalSpent, currency),
    avgTransaction: formatCurrency(avgTransaction, currency),
    totalReceipts,
    avgDaily: formatCurrency(avgDaily, currency),
    spendingFrequency: Math.round(spendingFrequency),
    topCategory,
    topVendor,
    vendorOthers,
    highestDay: dateWithAmount(highestDay),
    lowestDay: dateWithAmount(lowestDay),
    trend: t(trendKey),
    pattern: t(patternKey),
    patternAdvice: t(patternAdvice),
    projectedMonthly: formatCurrency(avgDaily * 30, currency),
    magnitude: t(magnitudeKey),
    frequency: t(frequencyKey),
  });
};

/**
 * Builds the markdown report through the user's own configured AI provider.
 * Keys are read from the browser and never leave it. Falls back to a
 * deterministic report when the provider returns no content.
 *
 * Note: when there are no receipts we return a helpful explainer without
 * touching the provider, so the user is not blocked on AI being enabled.
 */
export const generateAiReport = async (params: AiReportParams, t: Translate): Promise<string> => {
  const { summary, spendingData, vendorData, dateRange, currency } = params;

  if (summary.totalReceipts === 0) {
    return buildNoReceiptsReport(dateRange, t);
  }

  const settings = await getAiSettings();
  const key = getStoredApiKey();
  if (!settings?.enabled || !settings.chatModel) {
    throw new Error(t('insightsReport.aiNotEnabled'));
  }

  const config = {
    provider: settings.provider,
    baseUrl: settings.baseUrl,
    model: settings.chatModel,
    apiKey: key,
  };

  // Report prose follows the interface language, so the document matches the UI
  // the reader is already looking at.
  const reportLanguage: Record<string, string> = {
    ar: 'Arabic, using Arabic script',
    fr: 'French',
    en: 'English',
  };
  const uiLanguage = i18n.resolvedLanguage ?? i18n.language;

  const prompt = [
    {
      role: 'system' as const,
      content:
        `You are a financial analyst. Write a clear, honest markdown report for a small business owner or household. Use the exact numbers given. No invented figures. Use headings, bullets, and short paragraphs. Write the whole report in ${
          reportLanguage[uiLanguage] ?? 'English'
        } - that is the language the reader is using in the app. Keep currency and dates exactly as given.`, 
    },
    {
      role: 'user' as const,
      content: `Financial summary for the last ${dateRange} days:
Total spent: ${summary.totalSpent} ${currency}
Average per receipt: ${summary.averagePerReceipt}
Receipts count: ${summary.totalReceipts}
Top category: ${summary.topCategory ?? 'n/a'}
Top vendor: ${summary.topVendor ?? 'n/a'}
Daily spending: ${
        spendingData
          .filter(d => d.value > 0)
          .map(d => `${d.date}: ${d.value}`)
          .join(', ') || 'none'
      }
Top vendors: ${vendorData.map(v => `${v.name}: ${v.value}`).join(', ') || 'none'}

Write a short financial report with: an executive summary, spending breakdown by category, top vendors, and 3 practical recommendations.`,
    },
  ];

  const response = await chatCompletion(config, prompt, []);
  return response.content ?? buildFallbackReport(params, t);
};