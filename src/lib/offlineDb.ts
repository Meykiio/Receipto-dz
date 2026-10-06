import type { ReviewDraft } from './drafts';

const DB_NAME = 'receipto-offline';
const STORE = 'pending-drafts';

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE, { keyPath: 'id' });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const tx = async <T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openDb();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE, mode);
    const request = run(transaction.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => db.close();
  });
};

export const savePendingDraft = (draft: ReviewDraft): Promise<IDBValidKey> =>
  tx('readwrite', (store) => store.put(draft));

export const getPendingDrafts = (): Promise<ReviewDraft[]> =>
  tx('readonly', (store) => store.getAll() as IDBRequest<ReviewDraft[]>);

export const removePendingDraft = (id: string): Promise<undefined> =>
  tx('readwrite', (store) => store.delete(id));
