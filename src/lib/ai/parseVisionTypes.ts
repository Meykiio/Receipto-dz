export interface AiConfig {
  provider: 'gemini' | 'openai_compatible';
  baseUrl: string | null;
  model: string;
  apiKey: string | null;
}