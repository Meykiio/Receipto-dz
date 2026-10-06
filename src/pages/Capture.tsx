import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { parseReceiptFile } from '@/lib/parser';
import { draftStore, newDraft } from '@/lib/drafts';
import { aiScanReceipt } from '@/lib/ai/parseVision';
import { getAiSettings } from '@/services/aiSettingsService';
import { Sparkles, Image, Camera, FileText, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { cn } from '@/lib/utils';
import PageHeader from '@/components/PageHeader';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? result);
    };
    reader.onerror = () => reject(new Error('Could not read the image'));
    reader.readAsDataURL(file);
  });

export default function Capture() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [aiAvailable, setAiAvailable] = useState(false);
  const [useAi, setUseAi] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getAiSettings();
        setAiAvailable(!!settings?.enabled && !!settings.visionModel);
      } catch {
        setAiAvailable(false);
      }
    })();
  }, []);

  const handleFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(t('capture.invalidType'), { description: t('capture.invalidTypeDesc') });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(t('capture.tooLarge'), { description: t('capture.tooLargeDesc') });
        return;
      }

      if (file.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setPreviewUrl(null);
      }

      setParsing(true);
      setProgress(0.1);
      try {
        let parsed;
        if (useAi && aiAvailable && file.type.startsWith('image/')) {
          const base64 = await fileToBase64(file);
          parsed = await aiScanReceipt(base64);
        } else {
          parsed = await parseReceiptFile(file, (p) => setProgress(p));
        }
        const draft = newDraft(file);
        draftStore.set({
          ...draft,
          parsed,
          status: 'review',
          imagePath: null,
        });
        setProgress(1);
        navigate('/review');
      } catch (error) {
        console.error('Parse error:', error);
        const draft = newDraft(file);
        draftStore.set({
          ...draft,
          parsed: null,
          status: 'review',
          error: error instanceof Error ? error.message : t('capture.couldNotRead'),
        });
        navigate('/review');
      } finally {
        setParsing(false);
      }
    },
    [navigate, t, useAi, aiAvailable]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFile(files[0]);
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <PageHeader title={t('capture.title')} description={t('capture.subtitle')} />

        <div
          className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center min-h-[260px] transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={t('a11y.receiptPreview')}
              className="max-h-64 rounded-md border mb-4 object-contain"
            />
          ) : (
            <div className="flex flex-col items-center text-center py-6">
              <Image className="h-12 w-12 text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-1">{t('capture.yourPhoto')}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t('capture.dragHere')}</p>
            </div>
          )}

          {parsing ? (
            <div className="w-full max-w-sm space-y-2">
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t('capture.reading')}</span>
              </div>
              <Progress value={progress * 100} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                {progress < 0.5 ? t('capture.extracting') : progress < 0.9 ? t('capture.identifying') : t('capture.almostDone')}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) handleFile(files[0]);
                    e.target.value = '';
                  }}
                />
                <Button
                  className="flex-1 flex items-center gap-2 bg-primary hover:bg-primary/90 min-h-12 text-base"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="h-5 w-5" />
                  {t('capture.takePhoto')}
                </Button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(',')}
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) handleFile(files[0]);
                    e.target.value = '';
                  }}
                />
                <Button
                  variant="outline"
                  className="flex-1 flex items-center gap-2 min-h-12"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <FileText className="h-4 w-4" />
                  {t('capture.chooseFile')}
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between gap-3 rounded-lg border border-brand-blue/30 bg-brand-blue/5 px-4 py-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Sparkles className="h-4 w-4 shrink-0 text-brand-blue" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{t('capture.scanWithAi')}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {aiAvailable ? t('capture.scanWithAiDesc') : t('capture.scanWithAiDisabled')}
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex shrink-0 cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={useAi && aiAvailable}
                      onChange={(e) => setUseAi(e.target.checked)}
                      disabled={!aiAvailable}
                      className="peer sr-only"
                    />
                    <span className={cn(
                      "h-6 w-11 rounded-full transition-colors",
                      aiAvailable ? "bg-muted peer-checked:bg-brand-blue peer-focus-visible:outline-2 peer-focus-visible:outline-brand-blue" : "bg-muted/50 cursor-not-allowed"
                    )} />
                    <span className={cn(
                      "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform",
                      aiAvailable && "peer-checked:translate-x-5",
                      !aiAvailable && "opacity-50"
                    )} />
                  </label>
                </div>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{t('capture.supportedTypes')}</h2>
            <ul className="space-y-2">
              {[t('capture.supportedTypesItem1'), t('capture.supportedTypesItem2'), t('capture.supportedTypesItem3')].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-positive" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">{t('capture.bestResults')}</h2>
            <ul className="space-y-2">
              {[t('capture.bestResultsItem1'), t('capture.bestResultsItem2'), t('capture.bestResultsItem3')].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-positive" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
