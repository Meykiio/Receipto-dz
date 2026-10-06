import jsPDF from 'jspdf';
import { toast } from 'sonner';
import { BRAND_RGB, aiReportFilename, savePdf } from './pdfShared';
import type { Translate } from './reportTypes';

const MARGIN = 15;

/**
 * Renders a markdown report to PDF with a minimal markdown-to-layout pass:
 * headings, bullets, horizontal rules, word wrapping, and pagination.
 */
export const downloadAiReportAsPdf = (
  aiReport: string,
  dateRange: string,
  t: Translate,
): boolean => {
  if (!aiReport) return false;

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const lines = aiReport.split('\n');
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxWidth = pageWidth - MARGIN * 2;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...BRAND_RGB);
    doc.text(t('insightsReport.aiPdfTitle'), pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Receipto', pageWidth / 2, y, { align: 'center' });
    y += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(t('insightsReport.pdfGeneratedOn', { date: currentDate }), pageWidth / 2, y, {
      align: 'center',
    });
    y += 6;
    doc.text(t('insightsReport.aiPdfPeriod', { days: dateRange }), pageWidth / 2, y, { align: 'center' });
    y += 10;

    doc.setDrawColor(...BRAND_RGB);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
    doc.setDrawColor(0);
    y += 12;

    doc.setFontSize(10);

    for (const currentLine of lines) {
      if (currentLine.trim() === '') {
        y += 3;
        continue;
      }

      if (currentLine.startsWith('# ')) {
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...BRAND_RGB);
        doc.text(currentLine.substring(2), pageWidth / 2, y, { align: 'center' });
        y += 10;
        doc.setTextColor(0, 0, 0);
        continue;
      }

      if (currentLine.startsWith('## ')) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(currentLine.substring(3), MARGIN, y);
        y += 8;
        continue;
      }

      if (currentLine.startsWith('### ')) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(currentLine.substring(4), MARGIN, y);
        y += 6;
        continue;
      }

      if (currentLine.startsWith('- ') || currentLine.startsWith('* ')) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('•', MARGIN, y);
        doc.text(currentLine.substring(2), MARGIN + 5, y);
        y += 5;
        continue;
      }

      if (currentLine.startsWith('---')) {
        doc.setDrawColor(200, 200, 200);
        doc.line(MARGIN, y, pageWidth - MARGIN, y);
        doc.setDrawColor(0);
        y += 5;
        continue;
      }

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const textWidth =
        (doc.getStringUnitWidth(currentLine) * doc.getFontSize()) / doc.internal.scaleFactor;

      if (textWidth > maxWidth) {
        const words = currentLine.split(' ');
        let linePart = '';

        for (const word of words) {
          const testLine = linePart + word + ' ';
          const testWidth =
            (doc.getStringUnitWidth(testLine) * doc.getFontSize()) / doc.internal.scaleFactor;

          if (testWidth > maxWidth) {
            doc.text(linePart, MARGIN, y);
            linePart = word + ' ';
            y += 5;
          } else {
            linePart = testLine;
          }
        }

        if (linePart.trim() !== '') {
          doc.text(linePart, MARGIN, y);
        }
      } else {
        doc.text(currentLine, MARGIN, y);
      }

      y += 5;

      if (y > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        y = 20;
      }
    }

    // Drop a trailing blank page created by the final spacer line.
    const pageCount = doc.getNumberOfPages ? doc.getNumberOfPages() : 1;
    if (pageCount > 1) {
      doc.setPage(pageCount);
      if (y < 30) {
        doc.deletePage(pageCount);
      }
    }

    const finalPageCount = doc.getNumberOfPages ? doc.getNumberOfPages() : 1;

    for (let i = 1; i <= finalPageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `${t('insightsReport.pageOf', { page: i, total: finalPageCount })} | ${t('insightsReport.footerApp')}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' },
      );
    }

    if (savePdf(doc, aiReportFilename())) {
      toast.success(t('insightsReport.aiPdfDownloaded'));
    } else {
      toast.error(t('insightsReport.aiPdfFailed'));
    }
  } catch (error) {
    console.error('Error generating AI PDF:', error);
    toast.error(t('insightsReport.aiPdfFailed'));
  }

  return true;
};