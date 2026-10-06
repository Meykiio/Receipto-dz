import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { MessageSquare, Menu, Plus, RefreshCw } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ChatSession } from "@/services/chatStorage";
import type { MouseEvent as ReactMouseEvent } from "react";

interface SessionListProps {
  sessions: ChatSession[];
  currentSession: ChatSession | null;
  isLoadingSessions: boolean;
  hasMore: boolean;
  onSessionSelect: (session: ChatSession) => void;
  onRename: (event?: ReactMouseEvent) => void;
  onDelete: (sessionId: string, event?: ReactMouseEvent) => void;
  onLoadMore: () => void;
  formatDate: (date: string) => string;
}

function SessionList({ sessions, currentSession, isLoadingSessions, hasMore, onSessionSelect, onRename, onDelete, onLoadMore, formatDate }: SessionListProps) {
  const { t } = useTranslation();
  return (
    <div className="p-2 space-y-2">
      {sessions.map((session) => (
        <div
          key={session.id}
          onClick={() => onSessionSelect(session)}
          className={`group flex cursor-pointer items-center justify-between rounded-lg p-3 ${currentSession?.id === session.id ? "bg-muted" : "hover:bg-muted/50"}`}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSessionSelect(session);
            }
          }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <MessageSquare className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="overflow-hidden">
              <p className="truncate font-medium">{session.title}</p>
              <p className="text-xs text-muted-foreground">{formatDate(session.created_at)}</p>
            </div>
          </div>
          <div className="flex transition-opacity md:opacity-0 md:group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">{t("assistant.openMenu")}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => onRename(e)}>{t("assistant.rename")}</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={(e) => onDelete(session.id, e)}>
                  {t("assistant.delete")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}

      {isLoadingSessions && (
        <div className="p-4 text-center">
          <div className="mb-2 flex justify-center">
            <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">{t("assistant.loading")}</p>
        </div>
      )}

      {!isLoadingSessions && sessions.length === 0 && (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">{t("assistant.noHistory")}</p>
        </div>
      )}

      {hasMore && !isLoadingSessions && (
        <Button variant="ghost" className="w-full text-xs text-muted-foreground" onClick={onLoadMore}>
          {t("assistant.loadMore")}
        </Button>
      )}
    </div>
  );
}

interface SessionSidebarProps extends SessionListProps {
  isMobileSidebarOpen: boolean;
  setIsMobileSidebarOpen: (open: boolean) => void;
  onNewChat: () => void;
}

export function SessionSidebar(props: SessionSidebarProps) {
  const { t } = useTranslation();
  const { isMobileSidebarOpen, setIsMobileSidebarOpen, onNewChat, onLoadMore, ...listProps } = props;

  const header = (
    <div className="flex items-center justify-between border-b p-4">
      <h2 className="font-semibold">{t("assistant.chatHistory")}</h2>
      <Button variant="ghost" size="sm" onClick={onNewChat}>
        <Plus className="h-4 w-4 me-2" />
        {t("assistant.newChat")}
      </Button>
    </div>
  );

  return (
    <>
      <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
        <SheetContent side="left" className="w-80 p-0 [&>button]:hidden">
          <div className="flex h-full flex-col">
            {header}
            <ScrollArea
              className="flex-1"
              onScrollCapture={(e) => {
                const target = e.currentTarget;
                const scrollContainer = target.querySelector("[data-radix-scroll-area-viewport]");
                if (scrollContainer) {
                  const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
                  if (scrollHeight - scrollTop <= clientHeight * 1.5) {
                    onLoadMore();
                  }
                }
              }}
            >
              <SessionList {...listProps} onLoadMore={onLoadMore} />
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      <div className="hidden h-full flex-col border-r md:flex md:w-80">
        {header}
        <ScrollArea className="flex-1">
          <SessionList {...listProps} onLoadMore={onLoadMore} />
        </ScrollArea>
      </div>
    </>
  );
}

export default SessionSidebar;