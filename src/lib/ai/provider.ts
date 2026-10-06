export interface AiMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  toolCallId?: string;
  toolName?: string;
  toolCalls?: Array<{
    id: string;
    name: string;
    arguments: Record<string, unknown>;
    signature?: string;
  }>;
}

export interface AiTool {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
}

export interface AiConfig {
  provider: 'gemini' | 'openai_compatible';
  baseUrl: string | null;
  model: string;
  apiKey: string | null;
}

export interface ChatResult {
  content: string | null;
  toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown>; signature?: string }>;
}

export class AiClientError extends Error {
  constructor(message: string, public code: string, public detail?: string) {
    super(message);
    this.name = 'AiClientError';
  }
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const normalizeToolArguments = (raw: string | Record<string, unknown>): Record<string, unknown> => {
  if (typeof raw === 'object' && raw !== null) return raw as Record<string, unknown>;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const callOpenAiCompatible = async (
  config: AiConfig,
  messages: AiMessage[],
  tools: AiTool[]
): Promise<ChatResult> => {
  const base = (config.baseUrl ?? '').replace(/\/+$/, '');
  const url = `${base}/chat/completions`;

  const body: Record<string, unknown> = {
    model: config.model,
    messages: messages.map((m) => {
      if (m.role === 'tool') {
        return { role: 'tool', tool_call_id: m.toolCallId, content: m.content };
      }
      const baseMessage: Record<string, unknown> = { role: m.role, content: m.content };
      if (m.toolCalls) {
        baseMessage.tool_calls = m.toolCalls.map((tc) => ({
          id: tc.id,
          type: 'function',
          function: { name: tc.name, arguments: JSON.stringify(tc.arguments) },
        }));
      }
      return baseMessage;
    }),
  };
  if (tools.length > 0) {
    body.tools = tools.map((tool) => ({
      type: 'function',
      function: { name: tool.name, description: tool.description, parameters: tool.parameters },
    }));
  }

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
    throw new AiClientError('Provider request failed', 'PROVIDER_ERROR', text.slice(0, 300));
  }

  const data = await response.json();
  const message = data?.choices?.[0]?.message;
  if (!message) throw new AiClientError('Invalid provider response', 'INVALID_RESPONSE');

  const toolCalls = (message.tool_calls ?? []).map((tc: Record<string, unknown>) => {
    const fn = (tc.function ?? {}) as Record<string, unknown>;
    return {
      id: tc.id as string,
      name: fn.name as string,
      arguments: normalizeToolArguments(fn.arguments as string),
    };
  });

  return { content: message.content ?? null, toolCalls };
};

const callGemini = async (
  config: AiConfig,
  messages: AiMessage[],
  tools: AiTool[]
): Promise<ChatResult> => {
  if (!config.apiKey) throw new AiClientError('Gemini requires an API key', 'MISSING_KEY');

  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => {
      if (m.role === 'tool') {
        // Gemini 3 protocol: tool results are sent back as role "user"
        // with a functionResponse part.
        return {
          role: 'user',
          parts: [{
            functionResponse: {
              name: m.toolName ?? 'unknown',
              response: { result: m.content },
            },
          }],
        };
      }
      if (m.toolCalls && m.toolCalls.length > 0) {
        return {
          role: 'model',
          parts: m.toolCalls.map((tc) => ({
            functionCall: {
              name: tc.name,
              args: tc.arguments,
              ...(tc.signature ? { thoughtSignature: tc.signature } : {}),
            },
          })),
        };
      }
      return { role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] };
    });

  const systemText = messages.filter((m) => m.role === 'system').map((m) => m.content).join('\n');

  const body: Record<string, unknown> = {
    contents,
    systemInstruction: systemText ? { parts: [{ text: systemText }] } : undefined,
  };

  if (tools.length > 0) {
    body.tools = [{
      functionDeclarations: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
      })),
    }];
  }

  const response = await fetch(`${GEMINI_BASE}/models/${config.model}:generateContent?key=${config.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new AiClientError('Gemini request failed', 'PROVIDER_ERROR', text.slice(0, 300));
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];

  let content: string | null = null;
  const toolCalls: Array<{ id: string; name: string; arguments: Record<string, unknown>; signature?: string }> = [];

  for (const part of parts) {
    if (part.text) content = (content ?? '') + part.text;
    if (part.functionCall) {
      toolCalls.push({
        id: `${part.functionCall.name}-${Math.random().toString(36).slice(2, 8)}`,
        name: part.functionCall.name,
        arguments: part.functionCall.args ?? {},
        signature: part.functionCall.thoughtSignature ?? undefined,
      });
    }
  }

  return { content, toolCalls };
};

export const chatCompletion = (config: AiConfig, messages: AiMessage[], tools: AiTool[]): Promise<ChatResult> => {
  if (config.provider === 'gemini') return callGemini(config, messages, tools);
  return callOpenAiCompatible(config, messages, tools);
};