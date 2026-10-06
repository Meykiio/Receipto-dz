import { useState, useEffect, useRef, useCallback } from "react";
import type { MouseEvent as ReactMouseEvent, FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { ChatMessage } from "@/types";
import { getInitialMessage } from "@/services/aiService";
import {
  getSavedSessions, saveSessions as persistSessions,
  getSavedMessages, saveMessages as persistMessages,
  removeSessionMessages, type ChatSession,
} from "@/services/chatStorage";
import { getAiSettings, getStoredApiKey } from "@/services/aiSettingsService";
import { runAssistant } from "@/lib/ai/chat";

const SESSIONS_PER_PAGE = 10;

export function useAssistantChat() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [newSessionTitle, setNewSessionTitle] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const loadSessionsWithPagination = useCallback((pageNum = 1) => {
    setIsLoadingSessions(true);
    try {
      const allSessions = getSavedSessions(user);
      const startIndex = (pageNum - 1) * SESSIONS_PER_PAGE;
      const endIndex = startIndex + SESSIONS_PER_PAGE;
      const paginatedSessions = allSessions.slice(startIndex, endIndex);

      setHasMore(endIndex < allSessions.length);

      if (pageNum === 1) {
        setSessions(paginatedSessions);

        if (paginatedSessions.length > 0) {
          setCurrentSession(paginatedSessions[0]);
        } else {
          const initialSession: ChatSession = {
            id: Date.now().toString(),
            title: t("assistant.newChat"),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          setSessions([initialSession]);
          setCurrentSession(initialSession);

          const initialMessage = getInitialMessage();
          setMessages([initialMessage]);
          persistMessages(initialSession.id, [initialMessage], user);
          persistSessions([initialSession], user);
        }
      } else {
        setSessions(prev => [...prev, ...paginatedSessions]);
      }
    } catch (error) {
      console.error("Failed to load chat sessions", error);
      toast.error(t("assistant.loadError"));
    } finally {
      setIsLoadingSessions(false);
    }
  }, [user, t]);

  const loadMoreSessions = () => {
    if (hasMore && !isLoadingSessions) {
      setPage(prev => prev + 1);
      loadSessionsWithPagination(page + 1);
    }
  };

  useEffect(() => {
    const checkAi = async () => {
      try {
        const settings = await getAiSettings();
        const key = getStoredApiKey();
        setAiEnabled(!!settings?.enabled && !!settings?.chatModel && (settings.provider === 'openai_compatible' || !!key));
      } catch (error) {
        console.error("Failed to load AI settings:", error);
        setAiEnabled(false);
      }
    };

    loadSessionsWithPagination(1);
    checkAi();
  }, [loadSessionsWithPagination]);

  useEffect(() => {
    if (currentSession) {
      loadSessionMessages(currentSession.id);
    } else {
      setMessages([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadSessionMessages = (sessionId: string) => {
    setIsLoadingMessages(true);
    try {
      const chatMessages = getSavedMessages(sessionId, user);

      if (chatMessages.length > 0) {
        setMessages(chatMessages);
      } else {
        const initialMessage = getInitialMessage();
        setMessages([initialMessage]);
        persistMessages(sessionId, [initialMessage], user);
      }
    } catch (error) {
      console.error("Failed to load chat messages", error);
      toast.error(t("assistant.conversationError"));
    } finally {
      setIsLoadingMessages(false);
    }
  };

  const handleNewChat = () => {
    const hasConversation = messages.length > 1 ||
      (messages.length === 1 && messages[0].role !== 'assistant');

    if (hasConversation || sessions.length === 0) {
      try {
        const newSession: ChatSession = {
          id: Date.now().toString(),
          title: t("assistant.newChat"),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const updatedSessions = [newSession, ...sessions];
        setSessions(updatedSessions);
        persistSessions(updatedSessions, user);

        setCurrentSession(newSession);
        setIsMobileSidebarOpen(false);

        const initialMessage = getInitialMessage();
        setMessages([initialMessage]);
        persistMessages(newSession.id, [initialMessage], user);

        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      } catch (error) {
        console.error("Failed to create new chat", error);
        toast.error(t("assistant.newChatError"));
      }
    } else {
      inputRef.current?.focus();
      toast.info(t("assistant.startConversationHint"));
    }
  };

  const handleSessionSelect = (session: ChatSession) => {
    setCurrentSession(session);
    setIsMobileSidebarOpen(false);
  };

  const handleDeleteSession = (sessionId: string, event?: ReactMouseEvent) => {
    event?.stopPropagation();

    if (!sessionId) return;

    try {
      if (sessions.length <= 1) {
        toast.info(t("assistant.keepOneChat"));
        return;
      }

      removeSessionMessages(sessionId);

      const updatedSessions = sessions.filter(s => s.id !== sessionId);
      setSessions(updatedSessions);
      persistSessions(updatedSessions, user);

      if (currentSession?.id === sessionId) {
        const deletedIndex = sessions.findIndex(s => s.id === sessionId);
        let newCurrentSession = null;

        if (deletedIndex === 0 && updatedSessions.length > 0) {
          newCurrentSession = updatedSessions[0];
        } else if (updatedSessions.length > 0) {
          newCurrentSession = updatedSessions[Math.min(deletedIndex, updatedSessions.length - 1)];
        }

        if (newCurrentSession) {
          setCurrentSession(newCurrentSession);
          loadSessionMessages(newCurrentSession.id);
        }
      }

      toast.success(t("assistant.chatDeleted"));
    } catch (error) {
      console.error("Failed to delete chat session", error);
      toast.error(t("assistant.deleteError"));
    }
  };

  const handleOpenRenameDialog = (event?: ReactMouseEvent) => {
    event?.stopPropagation();
    if (currentSession) {
      setNewSessionTitle(currentSession.title);
      setIsRenameDialogOpen(true);
    }
  };

  const handleRenameSession = () => {
    if (!currentSession || !newSessionTitle.trim()) return;

    try {
      const updatedSession = {
        ...currentSession,
        title: newSessionTitle,
        updated_at: new Date().toISOString(),
      };

      const updatedSessions = sessions.map(s =>
        s.id === updatedSession.id ? updatedSession : s
      );

      setSessions(updatedSessions);
      persistSessions(updatedSessions, user);

      setCurrentSession(updatedSession);
      setIsRenameDialogOpen(false);
      toast.success(t("assistant.chatRenamed"));
    } catch (error) {
      console.error("Failed to rename chat session", error);
      toast.error(t("assistant.renameError"));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading || !currentSession) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    setIsLoading(true);

    try {
      const settings = await getAiSettings();
      const key = getStoredApiKey();
      if (!settings?.enabled || !settings.chatModel) {
        throw new Error("AI is not enabled");
      }

      const config = {
        provider: settings.provider,
        baseUrl: settings.baseUrl,
        model: settings.chatModel,
        apiKey: key,
      };

      const history = updatedMessages
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map((m) => ({ role: m.role, content: m.content }));

      const aiResponse = await runAssistant(config, history);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      const messagesWithResponse = [...updatedMessages, aiMessage];

      setMessages(messagesWithResponse);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      try {
        persistMessages(currentSession.id, messagesWithResponse, user);
      } catch {
        // handled by saveMessages
      }
    } catch (error) {
      console.error("Error getting AI response", error);

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: t("assistant.error"),
        timestamp: new Date().toISOString(),
        error: true,
      };

      const messagesWithError = [...updatedMessages, errorMessage];

      setMessages(messagesWithError);

      try {
        persistMessages(currentSession.id, messagesWithError, user);
      } catch {
        // handled by saveMessages
      }

      toast.error(t("assistant.errorToast"));
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return t("assistant.today");
    } else if (date.toDateString() === yesterday.toDateString()) {
      return t("assistant.yesterday");
    } else {
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  };

  return {
    t,
    navigate,
    messages,
    input,
    setInput,
    isLoading,
    aiEnabled,
    sessions,
    currentSession,
    isLoadingSessions,
    isLoadingMessages,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isRenameDialogOpen,
    setIsRenameDialogOpen,
    newSessionTitle,
    setNewSessionTitle,
    messagesEndRef,
    inputRef,
    hasMore,
    loadMoreSessions,
    handleNewChat,
    handleSessionSelect,
    handleDeleteSession,
    handleOpenRenameDialog,
    handleRenameSession,
    handleSubmit,
    formatTime,
    formatDate,
  };
}
