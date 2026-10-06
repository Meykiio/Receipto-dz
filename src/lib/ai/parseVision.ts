import { getAiSettings, getStoredApiKey } from '@/services/aiSettingsService';
import type { ParsedReceipt } from '../parser/types';
import type { AiConfig } from './parseVisionTypes';

// AI-optional receipt scanning: uses the user's vision model to extract
// receipt fields directly from an image. This is an alternative to the local
// OCR path; both converge on the same Review screen.

const buildSystemPrompt = (): string =>
  `You extract receipt data from an image. Return ONLY JSON with this exact shape:
{
  "vendorName": string | null,
  "receiptDate": "YYYY-MM-DD" | null,
  "total": number | null,
  "tax": number | null,
  "currency": string | null,
  "paymentMethod": string | null,
  "items": [{ "description": string, "quantity": number | null, "unitPrice": number | null, "total": number | null }]
}
Normalize numbers to dot decimals. Use the date on the receipt. If unsure, use null.`;

export const aiScanReceipt = async (imageBase64: string): Promise<ParsedReceipt> => {
  const settings = await getAiSettings();
  const key = getStoredApiKey();
  if (!settings?.enabled || !settings.visionModel) {
    throw new Error('AI is not enabled or no vision model is configured');
  }

  const config: AiConfig = {
    provider: settings.provider,
    baseUrl: settings.baseUrl,
    model: settings.visionModel,
    apiKey: key,
  };

  const response = await fetchVisionChat(config, imageBase64, buildSystemPrompt());
  const text = extractJson(response);
  if (!text) throw new Error('The model did not return usable data');
  const data = JSON.parse(text) as Omit<ParsedReceipt, 'confidence'>;

  return {
    vendorName: data.vendorName ?? null,
    receiptDate: data.receiptDate ?? null,
    total: typeof data.total === 'number' ? data.total : null,
    tax: typeof data.tax === 'number' ? data.tax : null,
    currency: data.currency ?? null,
    paymentMethod: data.paymentMethod ?? null,
    items: Array.isArray(data.items) ? data.items : [],
    confidence: { vendorName: 1, receiptDate: 1, total: 1, overall: 1 },
  };
};

const fetchVisionChat = async (
  config: AiConfig,
  imageBase64: string,
  systemPrompt: string
): Promise<string> => {
  if (config.provider === 'gemini') {
    if (!config.apiKey) throw new Error('Gemini requires an API key');
    const body = {
      contents: [{
        parts: [
          { text: systemPrompt },
          { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } },
        ],
      }],
    };
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    );
    if (!response.ok) throw new Error('Vision request failed');
    const data = await response.json();
    return data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
  }

  const base = (config.baseUrl ?? '').replace(/\/+$/, '');
  const body = {
    model: config.model,
    messages: [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Extract the receipt data from this image as JSON.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      },
    ],
  };
  const response = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error('Vision request failed');
  const data = await response.json();
  return data?.choices?.[0]?.message?.content ?? '';
};

const extractJson = (raw: string): string | null => {
  const match = raw.match(/```json\s*([\s\S]*?)\s*```/) || raw.match(/```\s*([\s\S]*?)\s*```/) || raw.match(/{[\s\S]*}/);
  if (match) return match[1] ?? match[0];
  return raw.includes('{') && raw.includes('}') ? raw : null;
};