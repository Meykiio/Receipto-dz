import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Settings2, Sparkles } from "lucide-react";
import type { FormEvent, RefObject } from "react";

interface ChatComposerProps {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  aiEnabled: boolean | null;
  currentSession: boolean;
  onSubmit: (e: FormEvent) => void;
  onOpenSidebar: () => void;
  inputRef: RefObject<HTMLInputElement>;
}

export function ChatComposer({ input, setInput, isLoading, aiEnabled, currentSession, onSubmit, onOpenSidebar, inputRef }: ChatComposerProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="border-t bg-background">
      {aiEnabled === false && (
        <div className="mx-auto max-w-3xl px-4 pt-4">
          <div className="flex items-start gap-3 rounded-lg border bg-muted/50 p-4">
            <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm font-medium">{t("assistant.aiOffTitle")}</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("assistant.aiOffDesc")}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={() => navigate("/settings")}>
                <Settings2 className="h-3.5 w-3.5 me-1" />
                {t("assistant.enableInSettings")}
              </Button>
            </div>
          </div>
        </div>
      )}
      <form onSubmit={onSubmit} className="mx-auto flex max-w-3xl gap-2 p-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 md:hidden"
          onClick={onOpenSidebar}
        >
          <MessageSquare className="h-4 w-4" />
          <span className="sr-only">{t("assistant.chatHistory")}</span>
        </Button>
        <Input
          ref={inputRef}
          placeholder={t("assistant.placeholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading || !currentSession || aiEnabled === false}
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={isLoading || !input.trim() || !currentSession || aiEnabled === false} className="shrink-0 bg-brand-blue hover:bg-brand-lightBlue">
          <Send className="h-4 w-4" />
          <span className="sr-only">{t("assistant.send")}</span>
        </Button>
      </form>
      <div className="mx-auto max-w-3xl px-4 pb-4">
        <p className="text-xs text-muted-foreground">{t("assistant.example")}</p>
      </div>
    </div>
  );
}

export default ChatComposer;