import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { AlertTriangle, Download, Settings2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAiSettings } from '@/services/aiSettingsService';
import { generateAiReport } from './aiReport';
import { downloadAiReportAsPdf } from './aiReportPdf';
import type { AiReportParams } from './aiReport';

interface AiReportTabProps {
  params: AiReportParams;
  dateRange: string;
}

const AiOffPanel = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center p-10 border rounded-lg">
      <div className="flex w-full max-w-md items-start gap-3 rounded-lg border bg-muted/50 p-4 text-start">
        <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">{t('insightsReport.aiOffTitle')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t('insightsReport.aiOffDesc')}</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate('/settings')}>
            <Settings2 className="me-1 h-3.5 w-3.5" />
            {t('insightsReport.enableInSettings')}
          </Button>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ onRun }: { onRun: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border rounded-lg">
      <Sparkles className="h-12 w-12 text-primary mb-4" />
      <h3 className="text-xl font-semibold mb-2">{t('insightsReport.aiTitle')}</h3>
      <p className="text-muted-foreground mb-6">{t('insightsReport.aiDescription')}</p>
      <Button onClick={onRun} className="flex items-center gap-2">
        <Sparkles className="w-4 h-4" /> {t('insightsReport.generateAiReport')}
      </Button>
    </div>
  );
};

const GeneratingState = () => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border rounded-lg">
      <div className="animate-pulse">
        <Sparkles className="h-12 w-12 text-primary mb-4" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{t('insightsReport.generating')}</h3>
      <p className="text-muted-foreground">{t('insightsReport.generatingHint')}</p>
    </div>
  );
};

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border rounded-lg">
      <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="text-xl font-semibold mb-2">{t('insightsReport.unableToGenerate')}</h3>
      <p className="text-muted-foreground mb-6">{message}</p>
      <div className="space-y-4">
        {message.includes(t('insightsReport.noReceiptsMatch')) && (
          <div className="text-start bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">{t('insightsReport.suggestions')}:</h4>
            <ul className="list-disc ps-5 space-y-1 text-sm">
              <li>{t('insightsReport.suggestionUpload')}</li>
              <li>{t('insightsReport.suggestionProcessing')}</li>
              <li>{t('insightsReport.suggestionDateRange')}</li>
              <li>{t('insightsReport.suggestionRefresh')}</li>
            </ul>
          </div>
        )}
        <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> {t('insightsReport.tryAgain')}
        </Button>
      </div>
    </div>
  );
};

const ReportResult = ({ report, dateRange }: { report: string; dateRange: string }) => {
  const { t } = useTranslation();
  return (
    <div className="mt-4">
      <div className="border rounded-lg p-6 markdown-container overflow-auto max-h-[60vh]">
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={() => downloadAiReportAsPdf(report, dateRange, t)} className="flex items-center gap-2">
          <Download className="h-4 w-4" /> {t('insightsReport.downloadAiPdf')}
        </Button>
      </div>
    </div>
  );
};

/**
 * AI tab of the financial report. Owns its own state and is fully inert when the
 * user has not enabled AI — the basic report tab keeps working without it.
 */
export const AiReportTab = ({ params, dateRange }: AiReportTabProps) => {
  const { t } = useTranslation();
  // null until resolved, so the "AI is off" panel never flashes on a slow load.
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [report, setReport] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAiSettings()
      .then((settings) => {
        if (!cancelled) setAiEnabled(Boolean(settings?.enabled));
      })
      .catch(() => {
        if (!cancelled) setAiEnabled(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const run = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      setReport(await generateAiReport(params, t));
    } catch (e) {
      console.error('AI Report Error:', e);
      setError(e instanceof Error && e.message ? e.message : t('insightsReport.aiUnknownError'));
    } finally {
      setIsGenerating(false);
    }
  };

  if (aiEnabled === false) return <AiOffPanel />;

  return (
    <>
      {!report && !isGenerating && !error && <EmptyState onRun={run} />}
      {isGenerating && <GeneratingState />}
      {error && <ErrorState message={error} onRetry={run} />}
      {report && !isGenerating && <ReportResult report={report} dateRange={dateRange} />}
    </>
  );
};