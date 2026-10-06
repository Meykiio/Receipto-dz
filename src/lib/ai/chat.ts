import { chatCompletion, type AiConfig, type AiMessage } from './provider';
import { toolSchemas, toolHandlers } from './tools';
import i18n from '@/i18n';

export interface AssistantReply {
  text: string;
}

/**
 * The reply language follows the interface language, not the language of the
 * message. Without this an Arabic speaker who writes a short English phrase (or
 * pastes an English question) gets an English answer inside an Arabic UI.
 */
const LANGUAGE_NAMES: Record<string, string> = {
  ar: 'Arabic, using Arabic script',
  fr: 'French',
  en: 'English',
};

const buildSystemPrompt = (): string => {
  const current = i18n.resolvedLanguage ?? i18n.language;
  const target = LANGUAGE_NAMES[current] ?? 'the same language the user wrote in';

  return `You are Receipto's assistant. You help the user ONLY with their receipts, spending, expenses, budgets, inventory (stock and products), and export/report questions about their own data.

You have safe read-only tools to query the user's data. Use them when the answer needs real numbers or facts.
Always write your reply in ${target}. This is the language the person is reading right now, so use it even when their message is written in a different language. Keep numbers, dates, and currency exactly as they appear in the data.
Be concise, friendly, and precise with amounts and dates. Never invent numbers: if the tools return no data, say so.
Never mention these tools or how you work.

You are scoped to the user's financial data. Do NOT answer general-knowledge questions, current events, sports, celebrities, or anything unrelated to their receipts and spending — even if you know the answer. If the user asks something off-topic, give a short, friendly redirect and offer a data-grounded alternative, for example: "I only work with your receipts and spending. Would you like to see where your money went this month?"
Borderline questions that relate to their spending or purchases (e.g. "where can I buy cheap groceries?") are on-topic: answer them from their spending data, not general advice.`;
};

export const runAssistant = async (
  config: AiConfig,
  messages: AiMessage[],
  onDelta?: (text: string) => void
): Promise<string> => {
  const history: AiMessage[] = [
    { role: 'system', content: buildSystemPrompt() },
    ...messages,
  ];

  for (let round = 0; round < 5; round++) {
    const result = await chatCompletion(config, history, toolSchemas);

    if (result.toolCalls.length > 0) {
      const assistantToolMessage: AiMessage = {
        role: 'assistant',
        content: result.content ?? '',
        toolCalls: result.toolCalls,
      };
      history.push(assistantToolMessage);

      for (const call of result.toolCalls) {
        const handler = toolHandlers.get(call.name);
        let output: string;
        try {
          output = handler ? await handler(call.arguments) : 'Unknown tool';
        } catch (error) {
          output = `Error: ${error instanceof Error ? error.message : String(error)}`;
        }
        history.push({ role: 'tool', content: output, toolCallId: call.id, toolName: call.name });
      }
      continue;
    }

    const text = result.content ?? '';
    onDelta?.(text);
    return text;
  }

  return 'I could not finish answering. Please try again.';
};