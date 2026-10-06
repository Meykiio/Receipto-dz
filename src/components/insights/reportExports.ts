import jsPDF from 'jspdf';
import { formatCurrency, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { BRAND_RGB, reportFilename, savePdf } from './pdfShared';
import type {
  InsightsSummary,
  SpendingByVendorData,
  SpendingData,
  Translate,
} from './reportTypes';

export interface ReportExportParams {
  summary: InsightsSummary;
  spendingData: SpendingData[];
  vendorData: SpendingByVendorData[];
  dateRange: string;
  currency: string;
  dateSource: string;
}

const sourceLabel = (t: Translate, dateSource: string) =>
  t(dateSource === 'payment' ? 'insightsReport.sourcePayment' : 'insightsReport.sourceReceipt');

export const generateReportPdf = (
  { summary, spendingData, vendorData, dateRange, currency, dateSource }: ReportExportParams,
  t: Translate,
) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const source = sourceLabel(t, dateSource);

    doc.setFontSize(20);
    doc.setTextColor(...BRAND_RGB);
    doc.text(t('insightsReport.title'), 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(t('insightsReport.pdfGeneratedOn', { date: formatDate(new Date().toISOString()) }), 105, 25, {
      align: 'center',
    });
    doc.text(t('insightsReport.pdfPeriod', { days: dateRange, source }), 105, 32, { align: 'center' });

    doc.setDrawColor(...BRAND_RGB);
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    doc.setDrawColor(0);

    doc.setFontSize(16);
    doc.text(t('insightsReport.summary'), 14, 45);

    doc.setFontSize(12);
    const summaryData = [
      [t('insightsReport.totalSpent'), formatCurrency(summary.totalSpent, currency)],
      [t('insightsReport.averagePerReceipt'), formatCurrency(summary.averagePerReceipt, currency)],
      [t('insightsReport.totalReceipts'), summary.totalReceipts.toString()],
      [t('insightsReport.topCategory'), summary.topCategory || t('insightsReport.notAvailable')],
      [t('insightsReport.topVendor'), summary.topVendor || t('insightsReport.notAvailable')],
    ];

    try {
      doc.autoTable({
        startY: 50,
        head: [[t('insightsReport.metricColumn'), t('insightsReport.valueColumn')]],
        body: summaryData,
        theme: 'grid',
        headStyles: { fillColor: BRAND_RGB, textColor: 255 },
        styles: { overflow: 'linebreak', cellWidth: 'auto' },
        margin: { left: 14, right: 14 },
      });
    } catch (tableError) {
      console.error('Error creating summary table:', tableError);
      let y = 50;
      summaryData.forEach(row => {
        doc.text(`${row[0]}: ${row[1]}`, 14, y);
        y += 8;
      });
    }

    doc.setFontSize(16);
    const finalY1 = doc.lastAutoTable?.finalY || 100;
    doc.text(t('insightsReport.spendingData'), 14, finalY1 + 15);

    const filteredSpendingData = spendingData.filter(item => item.value > 0);

    try {
      doc.autoTable({
        startY: finalY1 + 20,
        head: [[t('insightsReport.dateColumn'), t('insightsReport.amountColumn')]],
        body: filteredSpendingData.map(item => [
          new Date(item.date).toLocaleDateString(),
          formatCurrency(item.value, currency),
        ]),
        theme: 'grid',
        headStyles: { fillColor: BRAND_RGB, textColor: 255 },
        styles: { overflow: 'linebreak', cellWidth: 'auto' },
        margin: { left: 14, right: 14 },
      });
    } catch (tableError) {
      console.error('Error creating spending table:', tableError);
      let y = finalY1 + 20;
      filteredSpendingData.forEach(item => {
        doc.text(
          `${new Date(item.date).toLocaleDateString()}: ${formatCurrency(item.value, currency)}`,
          14,
          y,
        );
        y += 8;
      });
    }

    if (vendorData.length > 0) {
      doc.setFontSize(16);
      const finalY2 = doc.lastAutoTable?.finalY || 200;
      doc.text(t('insightsReport.topVendors'), 14, finalY2 + 15);

      try {
        doc.autoTable({
          startY: finalY2 + 20,
          head: [[t('insightsReport.vendorColumn'), t('insightsReport.amountColumn')]],
          body: vendorData.map(item => [item.name, formatCurrency(item.value, currency)]),
          theme: 'grid',
          headStyles: { fillColor: BRAND_RGB, textColor: 255 },
          styles: { overflow: 'linebreak', cellWidth: 'auto' },
          margin: { left: 14, right: 14 },
        });
      } catch (tableError) {
        console.error('Error creating vendor table:', tableError);
        let y = finalY2 + 20;
        vendorData.forEach(item => {
          doc.text(`${item.name}: ${formatCurrency(item.value, currency)}`, 14, y);
          y += 8;
        });
      }
    }

    const pageCount = doc.getNumberOfPages ? doc.getNumberOfPages() : 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${t('insightsReport.pageOf', { page: i, total: pageCount })} - ${t('insightsReport.footerApp')}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' },
      );
    }

    if (savePdf(doc, reportFilename('pdf'))) {
      toast.success(t('insightsReport.pdfDownloaded'));
    } else {
      toast.error(t('insightsReport.pdfFailed'));
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    toast.error(t('insightsReport.pdfFailed'));
  }
};

export const downloadReportCsv = (
  { summary, spendingData, vendorData }: Pick<ReportExportParams, 'summary' | 'spendingData' | 'vendorData'>,
  t: Translate,
) => {
  try {
    const summaryRows = [
      [t('insightsReport.summary')],
      [t('insightsReport.totalSpent'), summary.totalSpent],
      [t('insightsReport.averagePerReceipt'), summary.averagePerReceipt],
      [t('insightsReport.totalReceipts'), summary.totalReceipts],
      [t('insightsReport.topCategory'), summary.topCategory || t('insightsReport.notAvailable')],
      [t('insightsReport.topVendor'), summary.topVendor || t('insightsReport.notAvailable')],
      [''],
      [t('insightsReport.spendingData')],
      [t('insightsReport.dateColumn'), t('insightsReport.amountColumn')],
    ];

    const dataRows = spendingData
      .filter(item => item.value > 0)
      .map(item => [new Date(item.date).toLocaleDateString(), item.value]);

    const vendorRows =
      vendorData.length > 0
        ? [
            [''],
            [t('insightsReport.topVendors')],
            [t('insightsReport.vendorColumn'), t('insightsReport.amountColumn')],
            ...vendorData.map(item => [item.name, item.value]),
          ]
        : [];

    const csvContent = [...summaryRows, ...dataRows, ...vendorRows].map(row => row.join(',')).join('\n');

    const filename = reportFilename('csv');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    toast.success(t('insightsReport.csvDownloaded', { filename }));
  } catch (error) {
    console.error('Error generating CSV:', error);
    toast.error(t('insightsReport.csvFailed'));
  }
};