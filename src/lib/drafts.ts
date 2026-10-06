import type { ParsedReceipt } from './parser/types';

export interface ReviewDraft {
  id: string;
  imageFile: File | null;
  imagePath: string | null;
  parsed: ParsedReceipt | null;
  status: 'parsing' | 'review' | 'confirmed' | 'failed';
  error?: string;
  updatedAt: number;
}

type Listener = (draft: ReviewDraft | null) => void;

let current: ReviewDraft | null = null;
const listeners = new Set<Listener>();

const emit = () => listeners.forEach((l) => l(current));

export const draftStore = {
  get: (): ReviewDraft | null => current,

  set: (draft: ReviewDraft) => {
    current = draft;
    emit();
  },

  update: (patch: Partial<ReviewDraft>) => {
    if (!current) return;
    current = { ...current, ...patch, updatedAt: Date.now() };
    emit();
  },

  clear: () => {
    current = null;
    emit();
  },

  subscribe: (listener: Listener): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const newDraft = (imageFile: File | null): ReviewDraft => ({
  id: crypto.randomUUID(),
  imageFile,
  imagePath: null,
  parsed: null,
  status: 'parsing',
  updatedAt: Date.now(),
});
