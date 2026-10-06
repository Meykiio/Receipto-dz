import type { ChatMessage } from "@/types";
import i18n from "@/i18n";

/**
 * Assistant bootstrapping.
 *
 * NOTE: the chat assistant itself runs fully client-side via
 * `src/lib/ai/chat.ts` (provider-agnostic, user's own keys). The previous
 * Supabase Edge-Function path (chat-assistant / process-receipt /
 * export-report / financial-report) was removed during the open-source
 * cleanup because nothing invoked it and keeping unused, secret-scoped
 * functions around is a maintenance and security liability.
 */

export const getInitialMessage = (): ChatMessage => {
  return {
    id: "initial",
    role: "assistant",
    content: i18n.t("assistant.greeting"),
    timestamp: new Date().toISOString(),
  };
};