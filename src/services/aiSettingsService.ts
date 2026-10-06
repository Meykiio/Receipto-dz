import { supabase } from '@/integrations/supabase/client';
import type { AiSettings } from '@/types';

const KEY_STORAGE = 'receipto_ai_key';

export const getAiSettings = async (): Promise<AiSettings | null> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('ai_settings')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    enabled: data.enabled,
    provider: data.provider as AiSettings['provider'],
    baseUrl: data.base_url,
    chatModel: data.chat_model,
    visionModel: data.vision_model,
    embeddingModel: data.embedding_model,
    toolsSupported: data.tools_supported,
    visionSupported: data.vision_supported,
  };
};

export const saveAiSettings = async (settings: Partial<AiSettings>): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('ai_settings')
    .upsert({
      user_id: user.id,
      enabled: settings.enabled ?? false,
      provider: settings.provider ?? 'openai_compatible',
      base_url: settings.baseUrl ?? null,
      chat_model: settings.chatModel ?? null,
      vision_model: settings.visionModel ?? null,
      embedding_model: settings.embeddingModel ?? null,
      tools_supported: settings.toolsSupported ?? true,
      vision_supported: settings.visionSupported ?? false,
    }, { onConflict: 'user_id' });

  if (error) throw new Error(error.message);
};

export const getStoredApiKey = (): string | null => localStorage.getItem(KEY_STORAGE);
export const storeApiKey = (key: string | null): void => {
  if (key) localStorage.setItem(KEY_STORAGE, key);
  else localStorage.removeItem(KEY_STORAGE);
};