import { toast } from 'sonner';
import i18n from '@/i18n';
import type { ChatMessage, User } from '@/types';

const CHAT_SESSIONS_KEY = 'receipto_chat_sessions';
const CHAT_MESSAGES_PREFIX = 'receipto_chat_messages_';

export interface ChatSession {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

const getUserStorageKey = (key: string, user: User | null): string => {
  if (!user || !user.id) return key;
  return `${key}_${user.id}`;
};

export const getSavedSessions = (user: User | null): ChatSession[] => {
  try {
    const userKey = getUserStorageKey(CHAT_SESSIONS_KEY, user);
    const json = localStorage.getItem(userKey);
    return json ? JSON.parse(json) : [];
  } catch {
    console.error('Error loading chat sessions from localStorage');
    toast.error(i18n.t('assistant.loadError'));
    return [];
  }
};

export const saveSessions = (sessions: ChatSession[], user: User | null): void => {
  try {
    const userKey = getUserStorageKey(CHAT_SESSIONS_KEY, user);
    localStorage.setItem(userKey, JSON.stringify(sessions));
  } catch {
    console.error('Error saving chat sessions to localStorage');
    toast.error(i18n.t('assistant.saveHistoryError'));
  }
};

export const getSavedMessages = (sessionId: string, user: User | null): ChatMessage[] => {
  try {
    const userKey = getUserStorageKey(`${CHAT_MESSAGES_PREFIX}${sessionId}`, user);
    const json = localStorage.getItem(userKey);
    return json ? JSON.parse(json) : [];
  } catch {
    console.error('Error loading chat messages from localStorage');
    toast.error(i18n.t('assistant.conversationError'));
    return [];
  }
};

export const saveMessages = (sessionId: string, messages: ChatMessage[], user: User | null): void => {
  try {
    const userKey = getUserStorageKey(`${CHAT_MESSAGES_PREFIX}${sessionId}`, user);
    localStorage.setItem(userKey, JSON.stringify(messages));
  } catch {
    console.error('Error saving chat messages to localStorage');
    toast.error(i18n.t('assistant.saveConversationError'));
  }
};

export const removeSessionMessages = (sessionId: string): void => {
  localStorage.removeItem(`${CHAT_MESSAGES_PREFIX}${sessionId}`);
};