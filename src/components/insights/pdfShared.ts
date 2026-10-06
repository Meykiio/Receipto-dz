import 'jspdf-autotable';

// Extend jsPDF types so the autotable helpers are visible to TypeScript.
// This augmentation is project-wide as soon as this module is part of the build.
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: {
      finalY: number;
    };
    getNumberOfPages(): number;
    autoTable: (options: Record<string, unknown>) => void;
  }
}

export const todayStamp = () => new Date().toISOString().split('T')[0];

export const reportFilename = (extension: string) =>
  `financial_insights_report_${todayStamp()}.${extension}`;

export const aiReportFilename = () => `Financial_Analysis_Report_${todayStamp()}.pdf`;

/** Brand green, used for headings and table headers across exported PDFs. */
export const BRAND_RGB: [number, number, number] = [11, 126, 98];

/** Downloads a jsPDF document, falling back to a blob URL when save() is blocked. */
export const savePdf = (doc: import('jspdf').jsPDF, filename: string): boolean => {
  try {
    doc.save(filename);
    return true;
  } catch (saveError) {
    console.error('Error saving PDF:', saveError);
  }

  try {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
    return true;
  } catch (fallbackError) {
    console.error('Alternative save method failed:', fallbackError);
    return false;
  }
};