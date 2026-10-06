import { getAiSettings, getStoredApiKey } from '@/services/aiSettingsService';
import { supabase } from '@/integrations/supabase/client';
import type { AiConfig } from './parseVisionTypes';

const EMBEDDING_DIMENSION = 512;

export const generateEmbedding = async (input: string): Promise<number[]> => {
  const settings = await getAiSettings();
  const key = getStoredApiKey();
  if (!settings?.enabled || !settings.embeddingModel) {
    throw new Error('AI is not enabled or no embedding model is configured');
  }

  const config: AiConfig = {
    provider: settings.provider,
    baseUrl: settings.baseUrl,
    model: settings.embeddingModel,
    apiKey: key,
  };

  return embedWithOpenAiCompatible(config, input);
};

const embedWithOpenAiCompatible = async (config: AiConfig, input: string): Promise<number[]> => {
  const base = (config.baseUrl ?? '').replace(/\/+$/, '');
  const url = `${base}/embeddings`;

  const body: Record<string, unknown> = {
    model: config.model,
    input,
    dimensions: EMBEDDING_DIMENSION,
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.apiKey ? { Authorization: `Bearer ${config.apiKey}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Embedding request failed: ${text.slice(0, 200)}`);
  }

  const data = await response.json();
  const embedding = data?.data?.[0]?.embedding as number[] | undefined;
  if (!Array.isArray(embedding)) throw new Error('Invalid embedding response');

  if (embedding.length !== EMBEDDING_DIMENSION) {
    throw new Error(
      `Embedding dimension mismatch: model returned ${embedding.length}, expected ${EMBEDDING_DIMENSION}. ` +
      `Use an OpenAI-compatible embedding model that supports dimensions=512 (e.g. text-embedding-3-small).`
    );
  }

  return embedding;
};

const toVectorString = (embedding: number[]): string =>
  `[${embedding.join(',')}]`;

// Backfill embeddings for chunks that don't have one yet.
export const syncReceiptEmbeddings = async (): Promise<number> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data: chunks, error } = await supabase
    .from('receipt_chunks')
    .select('id, content')
    .eq('user_id', user.id)
    .is('embedding', null)
    .limit(50);

  if (error) throw new Error(error.message);
  if (!chunks || chunks.length === 0) return 0;

  for (const chunk of chunks) {
    const embedding = await generateEmbedding(chunk.content);
    await supabase
      .from('receipt_chunks')
      .update({ embedding: toVectorString(embedding) })
      .eq('id', chunk.id)
      .eq('user_id', user.id);
  }

  return chunks.length;
};

// Hybrid search over the user's receipt chunks.
export const searchReceiptChunks = async (query: string, limit = 5): Promise<Array<{
  id: number;
  receiptId: string;
  content: string;
}>> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Semantic path requires embeddings; keyword path works without them.
  let embedding: string | null = null;
  try {
    embedding = toVectorString(await generateEmbedding(query));
  } catch (e) {
    console.warn('Semantic search unavailable, using keyword only:', e);
  }

  const { data, error } = await supabase.rpc('hybrid_search', {
    p_query_text: query,
    p_query_embedding: embedding as string,
    p_match_count: limit,
  });

  if (error) throw new Error(error.message);
  return (data ?? []).map((row: { id: number; receipt_id: string; content: string }) => ({
    id: row.id,
    receiptId: row.receipt_id,
    content: row.content,
  }));
};