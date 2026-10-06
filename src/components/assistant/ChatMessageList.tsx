import { useTranslation } from "react-i18next";
import { Sparkles, User, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "@/types";
import type { FormEvent, RefObject } from "react";

interface ChatMessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  onRetry: (e: FormEvent) => void;
  formatTime: (timestamp: string) => string;
  messagesEndRef: RefObject<HTMLDivElement>;
}

const TypingDots = () => (
  <div className="flex items-end gap-2.5">
    <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue/15 text-brand-blue">
      <Sparkles className="h-3.5 w-3.5" />
    </div>
    <div className="rounded-2xl bg-muted px-4 py-3 shadow-sm">
      <div className="flex gap-1.5">
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0.2s" }} />
        <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  </div>
);

const LoadingMessages = ({ t }: { t: (key: string) => string }) => (
  <div className="flex h-full items-center justify-center">
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2">
        <div className="h-3 w-3 animate-bounce rounded-full bg-muted-foreground/40" />
        <div className="h-3 w-3 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0.2s" }} />
        <div className="h-3 w-3 animate-bounce rounded-full bg-muted-foreground/40" style={{ animationDelay: "0.4s" }} />
      </div>
      <p className="text-sm text-muted-foreground">{t("assistant.loadingConversation")}</p>
    </div>
  </div>
);

export function ChatMessageList({ messages, isLoading, isLoadingMessages, onRetry, formatTime, messagesEndRef }: ChatMessageListProps) {
  const { t } = useTranslation();
  const isStart = messages.length <= 1 && !isLoading;

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {isLoadingMessages ? (
        <LoadingMessages t={t} />
      ) : (
        <div className="mx-auto max-w-3xl space-y-5">
          {isStart && (
            <div className="flex flex-col items-center gap-2 pt-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-brand-blue/30 bg-brand-blue/10 text-brand-blue">
                <Sparkles className="h-6 w-6" />
              </div>
              <p className="text-sm text-muted-foreground">{t("assistant.example")}</p>
            </div>
          )}
          {messages.map((message) => (
            <div key={message.id} className={`flex items-end gap-2.5 ${message.role === "assistant" ? "" : "justify-end"}`}>
              {message.role === "assistant" && (
                <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-blue/15 text-brand-blue">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
              )}
              <div className="max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                    message.role === "assistant" ? "bg-muted text-foreground" : "bg-primary text-primary-foreground"
                  } ${message.error ? "border border-destructive" : ""}`}
                >
                  <div className="whitespace-pre-line">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  {message.error && (
                    <div className="mt-2 flex justify-end border-t border-destructive/30 pt-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        onClick={onRetry}
                        aria-label={t("assistant.retry")}
                      >
                        <RefreshCw className="me-1 h-3 w-3" />
                        {t("assistant.retry")}
                      </Button>
                    </div>
                  )}
                </div>
                <span className={`mt-1 block text-[11px] text-muted-foreground ${message.role === "assistant" ? "" : "text-end"}`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
              {message.role === "user" && (
                <div className="mb-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <User className="h-3.5 w-3.5" />
                </div>
              )}
            </div>
          ))}
          {isLoading && <TypingDots />}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
}

export default ChatMessageList;