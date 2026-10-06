import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReceipts,
  getReceiptById,
  confirmReceipt,
  updateReceipt,
  deleteReceipt,
  uploadReceiptImage,
  getReceiptImageUrl,
  getDamagedItemsBySupplier,
  deleteDamagedItem,
  type ReceiptDraft,
} from "@/services/receiptService";
import {
  getInventory,
  getProductHistory,
  adjustStock,
  findMatchingProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/services/inventoryService";
import { supabase } from "@/integrations/supabase/client";
import type { Receipt } from "@/types";

export const receiptKeys = {
  all: ["receipts"] as const,
  lists: () => [...receiptKeys.all, "list"] as const,
  list: (filters: string) => [...receiptKeys.lists(), { filters }] as const,
  details: () => [...receiptKeys.all, "detail"] as const,
  detail: (id: string) => [...receiptKeys.details(), id] as const,
};

export const inventoryKeys = {
  all: ["inventory"] as const,
  stock: () => [...inventoryKeys.all, "stock"] as const,
  history: (productId: string) => [...inventoryKeys.all, "history", productId] as const,
  matches: (name: string) => [...inventoryKeys.all, "matches", name] as const,
};

export const damagedKeys = {
  all: ["damaged-items"] as const,
  bySupplier: () => [...damagedKeys.all, "by-supplier"] as const,
};

export const useReceipts = () =>
  useQuery({ queryKey: receiptKeys.lists(), queryFn: getReceipts });

export const useReceipt = (id: string | null) =>
  useQuery({
    queryKey: receiptKeys.detail(id ?? ""),
    queryFn: () => getReceiptById(id as string),
    enabled: !!id,
  });

export const useConfirmReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (draft: ReceiptDraft) => confirmReceipt(draft),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      // Best-effort embedding backfill so hybrid search works for the new receipt
      try {
        const { syncReceiptEmbeddings } = await import('@/lib/ai/embeddings');
        await syncReceiptEmbeddings();
      } catch (e) {
        console.warn('Embedding backfill skipped:', e);
      }
    },
  });
};

export const useUpdateReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (receipt: Receipt) => updateReceipt(receipt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
};

export const useDeleteReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteReceipt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
};

export const useUploadReceiptImage = () =>
  useMutation({
    mutationFn: (file: File) => uploadReceiptImage(file),
  });

export const useReceiptImageUrl = (path: string | null) =>
  useQuery({
    queryKey: ["receipt-image-url", path],
    queryFn: () => getReceiptImageUrl(path as string),
    enabled: !!path,
    staleTime: 30 * 60 * 1000,
  });

export const useInventory = () =>
  useQuery({ queryKey: inventoryKeys.stock(), queryFn: getInventory });

export const useProductHistory = (productId: string | null) =>
  useQuery({
    queryKey: inventoryKeys.history(productId ?? ""),
    queryFn: () => getProductHistory(productId as string),
    enabled: !!productId,
  });

export const useFindMatchingProducts = (name: string) =>
  useQuery({
    queryKey: inventoryKeys.matches(name),
    queryFn: () => findMatchingProducts(name),
    enabled: name.trim().length >= 2,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, defaultUnit, lowStockThreshold }: { name: string; defaultUnit?: string; lowStockThreshold?: number | null }) =>
      createProduct(name, defaultUnit, lowStockThreshold),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      delta,
      reason,
      note,
    }: {
      productId: string;
      delta: number;
      reason: "manual_in" | "manual_out" | "correction";
      note?: string | null;
    }) => adjustStock(productId, delta, reason, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      name,
      defaultUnit,
      lowStockThreshold,
    }: {
      productId: string;
      name?: string;
      defaultUnit?: string;
      lowStockThreshold?: number | null;
    }) => updateProduct(productId, { name, defaultUnit, lowStockThreshold }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => deleteProduct(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
};

export const useDamagedItemsBySupplier = () =>
  useQuery({ queryKey: damagedKeys.bySupplier(), queryFn: getDamagedItemsBySupplier });

export const useDeleteDamagedItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteDamagedItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: damagedKeys.all });
    },
  });
};

export const budgetKeys = {
  all: ["budgets"] as const,
  month: (month: string) => [...budgetKeys.all, month] as const,
};

export const useBudget = (month: string | null) =>
  useQuery({
    queryKey: budgetKeys.month(month ?? ""),
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !month) return null;
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id)
        .eq("month", month)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data ? { month: data.month, amount: data.amount, currency: data.currency } : null;
    },
    enabled: !!month,
  });

export const useSetBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ month, amount, currency }: { month: string; amount: number; currency: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase
        .from("budgets")
        .upsert({ user_id: user.id, month, amount, currency }, { onConflict: "user_id,month" });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    },
  });
};

export const useReportDamage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      receiptId,
      receiptItemId,
      damagedQuantity,
      damageNotes,
    }: {
      receiptId: string;
      receiptItemId: string;
      damagedQuantity: number;
      damageNotes: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const { error } = await supabase.rpc("report_damage", {
        p_receipt_id: receiptId,
        p_receipt_item_id: receiptItemId,
        p_damaged_quantity: damagedQuantity,
        p_damage_notes: damageNotes,
      });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: receiptKeys.all });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
      queryClient.invalidateQueries({ queryKey: damagedKeys.all });
    },
  });
};
