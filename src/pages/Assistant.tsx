import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAssistantChat } from "@/lib/assistant/useAssistantChat";
import { SessionSidebar } from "@/components/assistant/SessionSidebar";
import { ChatMessageList } from "@/components/assistant/ChatMessageList";
import { ChatComposer } from "@/components/assistant/ChatComposer";
import { RenameDialog } from "@/components/assistant/RenameDialog";

export default function Assistant() {
  const { t } = useTranslation();
  const chat = useAssistantChat();

  return (
    <AppLayout>
      <div className="flex h-full bg-background text-foreground">
        <SessionSidebar
          sessions={chat.sessions}
          currentSession={chat.currentSession}
          isLoadingSessions={chat.isLoadingSessions}
          hasMore={chat.hasMore}
          isMobileSidebarOpen={chat.isMobileSidebarOpen}
          setIsMobileSidebarOpen={chat.setIsMobileSidebarOpen}
          onNewChat={chat.handleNewChat}
          onSessionSelect={chat.handleSessionSelect}
          onRename={chat.handleOpenRenameDialog}
          onDelete={chat.handleDeleteSession}
          onLoadMore={chat.loadMoreSessions}
          formatDate={chat.formatDate}
        />

        <div className="flex h-full flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b p-4">
            <h1 className="text-xl font-bold">{chat.currentSession?.title || t("assistant.title")}</h1>
            <div className="flex items-center gap-2">
              {chat.currentSession && (
                <Button variant="outline" size="sm" onClick={chat.handleOpenRenameDialog}>
                  {t("assistant.rename")}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={chat.handleNewChat}>
                <Plus className="h-4 w-4 me-2" />
                {t("assistant.newChat")}
              </Button>
            </div>
          </div>

          <ChatMessageList
            messages={chat.messages}
            isLoading={chat.isLoading}
            isLoadingMessages={chat.isLoadingMessages}
            onRetry={chat.handleSubmit}
            formatTime={chat.formatTime}
            messagesEndRef={chat.messagesEndRef}
          />

          <ChatComposer
            input={chat.input}
            setInput={chat.setInput}
            isLoading={chat.isLoading}
            aiEnabled={chat.aiEnabled}
            currentSession={!!chat.currentSession}
            onSubmit={chat.handleSubmit}
            onOpenSidebar={() => chat.setIsMobileSidebarOpen(true)}
            inputRef={chat.inputRef}
          />
        </div>
      </div>

      <RenameDialog
        open={chat.isRenameDialogOpen}
        onOpenChange={chat.setIsRenameDialogOpen}
        title={chat.newSessionTitle}
        setTitle={chat.setNewSessionTitle}
        onSave={chat.handleRenameSession}
      />
    </AppLayout>
  );
}