import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, BarChart, Download, FileDown, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency, formatDate } from "@/lib/utils";
import { AiReportTab } from "./insights/AiReportTab";
import { downloadReportCsv, generateReportPdf } from "./insights/reportExports";
import type { InsightsReportProps } from "./insights/reportTypes";

const InsightsReport = ({
  isOpen,
  onClose,
  summary,
  spendingData,
  vendorData,
  dateRange,
  currency,
  dateSource = "receipt"
}: InsightsReportProps) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("basic");

  const sourceLabel = t(
    dateSource === 'payment' ? 'insightsReport.sourcePayment' : 'insightsReport.sourceReceipt',
  );
  const exportParams = {
    summary,
    spendingData,
    vendorData,
    dateRange,
    currency,
    dateSource,
  };

  const handleGeneratePDF = () => generateReportPdf(exportParams, t);

  const downloadCSV = () => downloadReportCsv({ summary, spendingData, vendorData }, t);

  const aiParams = { summary, spendingData, vendorData, dateRange, currency };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('insightsReport.title')}
          </DialogTitle>
          <DialogDescription>{t('insightsReport.description', { days: dateRange })}</DialogDescription>
        </DialogHeader>

        <Alert className="my-2">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{t('insightsReport.temporaryAlert')}</AlertDescription>
        </Alert>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <BarChart className="w-4 h-4" />
              {t('insightsReport.basicTab')}
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {t('insightsReport.aiTab')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-0">
            <div className="mt-4 border rounded-lg p-4" ref={reportRef}>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold">{t('insightsReport.title')}</h2>
                <p className="text-muted-foreground">
                  {t('insightsReport.generatedOn', { date: formatDate(new Date().toISOString()) })}
                </p>
                <p className="text-muted-foreground">
                  {t('insightsReport.period', { days: dateRange, source: sourceLabel })}
                </p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{t('insightsReport.summary')}</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="font-medium">{t('insightsReport.totalSpent')}:</div>
                  <div>{formatCurrency(summary.totalSpent, currency)}</div>

                  <div className="font-medium">{t('insightsReport.averagePerReceipt')}:</div>
                  <div>{formatCurrency(summary.averagePerReceipt, currency)}</div>

                  <div className="font-medium">{t('insightsReport.totalReceipts')}:</div>
                  <div>{summary.totalReceipts}</div>

                  <div className="font-medium">{t('insightsReport.topCategory')}:</div>
                  <div>{summary.topCategory || t('insightsReport.notAvailable')}</div>

                  <div className="font-medium">{t('insightsReport.topVendor')}:</div>
                  <div>{summary.topVendor || t('insightsReport.notAvailable')}</div>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">
                  {t('insightsReport.spendingDataBySource', { source: sourceLabel })}
                </h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">{t('insightsReport.dateColumn')}</th>
                      <th className="text-right py-2">{t('insightsReport.amountColumn')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {spendingData
                      .filter(item => item.value > 0)
                      .map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-2">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="text-right py-2">{formatCurrency(item.value, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {vendorData.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">{t('insightsReport.topVendors')}</h3>
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">{t('insightsReport.vendorColumn')}</th>
                        <th className="text-right py-2">{t('insightsReport.amountColumn')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorData.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-2">{item.name}</td>
                          <td className="text-right py-2">{formatCurrency(item.value, currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end mt-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadCSV} className="flex items-center gap-2">
                  <FileDown className="h-4 w-4" /> {t('insightsReport.exportCsv')}
                </Button>
                <Button onClick={handleGeneratePDF} className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> {t('insightsReport.downloadPdf')}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai" className="mt-0">
            <AiReportTab params={aiParams} dateRange={dateRange} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>{t('insightsReport.close')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InsightsReport;