import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { getAiSettings, saveAiSettings, getStoredApiKey, storeApiKey } from '@/services/aiSettingsService';
import { chatCompletion } from '@/lib/ai/provider';
import { Sparkles, Loader2, CheckCircle2, XCircle } from 'lucide-react';

const PROVIDER_PRESETS = {
  gemini: { baseUrl: null, defaultModel: 'gemini-flash-latest', visionModel: 'gemini-flash-latest' },
  openai: { baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-5-mini', visionModel: 'gpt-5-mini' },
  groq: { baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile', visionModel: 'llama-3.3-70b-versatile' },
  openrouter: { baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'meta-llama/llama-3.3-70b-instruct', visionModel: 'meta-llama/llama-3.3-70b-instruct' },
  ollama: { baseUrl: 'http://localhost:11434/v1', defaultModel: 'gemma4', visionModel: 'llava:latest' },
};

export function AiSettingsPanel() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(false);
  const [providerPreset, setProviderPreset] = useState<'gemini' | 'openai' | 'groq' | 'openrouter' | 'ollama'>('openai');
  const [baseUrl, setBaseUrl] = useState('');
  const [chatModel, setChatModel] = useState('');
  const [visionModel, setVisionModel] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'idle' | 'ok' | 'fail'>('idle');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const settings = await getAiSettings();
        const key = getStoredApiKey();
        if (settings) {
          setEnabled(settings.enabled);
          setBaseUrl(settings.baseUrl ?? '');
          setChatModel(settings.chatModel ?? '');
          setVisionModel(settings.visionModel ?? '');
          if (settings.provider === 'gemini') setProviderPreset('gemini');
        }
        if (key) setApiKey(key);
      } catch (error) {
        console.error('Failed to load AI settings:', error);
      }
    })();
  }, []);

  const applyPreset = (preset: typeof providerPreset) => {
    setProviderPreset(preset);
    const p = PROVIDER_PRESETS[preset];
    setBaseUrl(p.baseUrl ?? '');
    setChatModel(p.defaultModel);
    setVisionModel(p.visionModel);
    if (preset === 'gemini') setBaseUrl('');
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult('idle');
    try {
      const config = {
        provider: providerPreset === 'gemini' ? ('gemini' as const) : ('openai_compatible' as const),
        baseUrl: baseUrl || null,
        model: chatModel,
        apiKey: apiKey || null,
      };
      const result = await chatCompletion(config, [{ role: 'user', content: 'Reply with exactly: OK' }], []);
      if (result.content) {
        setTestResult('ok');
        toast.success(t('aiSettings.connectionWorks'));
      } else {
        setTestResult('fail');
        toast.error(t('aiSettings.noResponse'));
      }
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult('fail');
      toast.error(error instanceof Error ? error.message : t('aiSettings.connectionFailed'));
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const provider = providerPreset === 'gemini' ? 'gemini' : 'openai_compatible';
      await saveAiSettings({
        enabled,
        provider,
        baseUrl: provider === 'gemini' ? null : baseUrl,
        chatModel,
        visionModel,
        toolsSupported: true,
        visionSupported: !!visionModel,
      });
      storeApiKey(apiKey || null);
      toast.success(t('aiSettings.saved'));
    } catch (error) {
      console.error('Save failed:', error);
      toast.error(t('aiSettings.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-brand-blue/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-brand-blue">
          <Sparkles className="h-4 w-4" />
          {t('aiSettings.title')}
        </CardTitle>
        <CardDescription>{t('aiSettings.subtitle')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground" id="ai-enable-label">{t('aiSettings.enable')}</p>
            <p className="text-sm text-muted-foreground">{t('aiSettings.enableDesc')}</p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} aria-labelledby="ai-enable-label" id="ai-enable" />
        </div>

        {enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="provider">{t('aiSettings.provider')}</Label>
              <Select value={providerPreset} onValueChange={(v) => applyPreset(v as typeof providerPreset)}>
                <SelectTrigger id="provider" aria-label={t('aiSettings.provider')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gemini">{t('aiSettings.gemini')}</SelectItem>
                  <SelectItem value="openai">{t('aiSettings.openai')}</SelectItem>
                  <SelectItem value="groq">{t('aiSettings.groq')}</SelectItem>
                  <SelectItem value="openrouter">{t('aiSettings.openrouter')}</SelectItem>
                  <SelectItem value="ollama">{t('aiSettings.ollama')}</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{t('aiSettings.ollamaHint')}</p>
            </div>

            {providerPreset !== 'gemini' && providerPreset !== 'ollama' && (
              <div className="space-y-2">
                <Label htmlFor="baseUrl">{t('aiSettings.apiUrl')}</Label>
                <Input id="baseUrl" value={baseUrl} onChange={(e) => setBaseUrl(e.target.value)} />
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="chatModel">{t('aiSettings.chatModel')}</Label>
                <Input id="chatModel" value={chatModel} onChange={(e) => setChatModel(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visionModel">{t('aiSettings.scanModel')}</Label>
                <Input id="visionModel" value={visionModel} onChange={(e) => setVisionModel(e.target.value)} placeholder={t('aiSettings.visionModelPlaceholder')} />
              </div>
            </div>

            {providerPreset !== 'ollama' && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">{t('aiSettings.apiKey')}</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={t('aiSettings.apiKeyPlaceholder')}
                />
                <p className="text-xs text-muted-foreground">{t('aiSettings.apiKeyHint')}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleTest} disabled={testing || !chatModel}>
                {testing ? <Loader2 className="me-1 h-4 w-4 animate-spin" /> : null}
                {t('aiSettings.test')}
              </Button>
              {testResult === 'ok' && <CheckCircle2 className="h-4 w-4 text-positive" />}
              {testResult === 'fail' && (
                <span className="flex items-center gap-1 text-sm text-destructive">
                  <XCircle className="h-4 w-4" /> {t('aiSettings.failed')}
                </span>
              )}
            </div>
          </>
        )}

        <Button onClick={handleSave} disabled={saving} className="bg-brand-blue text-white hover:bg-brand-blue/90">
          {saving ? t('aiSettings.saving') : t('aiSettings.save')}
        </Button>
      </CardContent>
    </Card>
  );
}