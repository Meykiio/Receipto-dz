import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getReceipts } from "@/services/receiptService";
import { Receipt } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteReceipt, useBudget } from "@/hooks/queries";
import { exportReceipts } from "@/services/exportService";
import { useMobile } from "@/hooks/useMobile";
import { getPageNumbers } from "@/lib/utils";

interface ReceiptState {
  receipts: Receipt[];
  loading: boolean;
  error: string | null;
  selectedReceipt: Receipt | null;
  isDetailsModalOpen: boolean;
  isMobileDetailsModalOpen: boolean;
  isEditModalOpen: boolean;
  selectedReceipts: string[];
  selectAll: boolean;
}

const initialState: ReceiptState = {
  receipts: [],
  loading: false,
  error: null,
  selectedReceipt: null,
  isDetailsModalOpen: false,
  isMobileDetailsModalOpen: false,
  isEditModalOpen: false,
  selectedReceipts: [],
  selectAll: false,
};

const RECEIPTS_PER_PAGE = 7;

export const useReceiptList = (currency?: string) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const deleteReceiptMutation = useDeleteReceipt();
  const isMobile = useMobile();

  const [state, setState] = useState<ReceiptState>(initialState);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(1);

  // budgets.month is a `date` column, so the month key must be a full YYYY-MM-01 date.
  const monthKey = new Date().toISOString().slice(0, 7) + "-01";
  const { data: budget } = useBudget(monthKey);

  useEffect(() => {
    const fetchReceipts = async () => {
      if (!user) return;
      setState(prevState => ({ ...prevState, loading: true, error: null }));
      try {
        const receipts = await getReceipts();
        setState(prevState => ({ ...prevState, receipts, loading: false }));
      } catch (error: unknown) {
        setState(prevState => ({
          ...prevState,
          error: error instanceof Error ? error.message : String(error),
          loading: false,
        }));
      }
    };
    fetchReceipts();
  }, [user]);

  const filteredReceipts = useMemo(() => {
    let filtered = state.receipts;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(receipt => {
        const vendor = receipt.vendorName || "";
        const items = (receipt.items || []).map(item => item.description).join(" ");
        return `${vendor} ${items}`.toLowerCase().includes(q);
      });
    }
    return filtered;
  }, [state.receipts, searchTerm]);

  const sortedReceipts = useMemo(() => {
    return [...filteredReceipts].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [filteredReceipts, sortOrder]);

  const totalPages = Math.ceil(filteredReceipts.length / RECEIPTS_PER_PAGE);
  const paginatedReceipts = sortedReceipts.slice((page - 1) * RECEIPTS_PER_PAGE, page * RECEIPTS_PER_PAGE);

  const pageNumbers = useMemo(() => getPageNumbers(page, totalPages), [page, totalPages]);

  const spentThisMonth = useMemo(() => {
    const now = new Date();
    return state.receipts
      .filter(r => {
        if (!r.receiptDate) return false;
        const d = new Date(r.receiptDate);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      })
      .reduce((sum, r) => sum + (r.total || 0), 0);
  }, [state.receipts]);

  const handleOpenDetailsModal = (receipt: Receipt) => {
    setState(prevState => ({ ...prevState, selectedReceipt: receipt, isDetailsModalOpen: !isMobile, isMobileDetailsModalOpen: isMobile }));
  };
  const handleCloseDetailsModal = () => {
    setState(prevState => ({ ...prevState, isDetailsModalOpen: false, isMobileDetailsModalOpen: false, selectedReceipt: null, isEditModalOpen: false }));
  };
  const handleEditReceipt = (receipt: Receipt) => {
    setState(prevState => ({ ...prevState, selectedReceipt: receipt, isEditModalOpen: true, isDetailsModalOpen: false, isMobileDetailsModalOpen: false }));
  };
  const handleReceiptUpdated = (updatedReceipt: Receipt) => {
    setState(prevState => ({
      ...prevState,
      receipts: prevState.receipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r),
      selectedReceipt: updatedReceipt,
      isEditModalOpen: false,
      isDetailsModalOpen: !isMobile,
      isMobileDetailsModalOpen: isMobile,
    }));
  };
  const handleOpenDeleteDialog = (receipt: Receipt) => {
    setState(prevState => ({ ...prevState, selectedReceipt: receipt }));
    setIsDeleteDialogOpen(true);
  };
  const handleCloseDeleteDialog = () => setIsDeleteDialogOpen(false);

  const toggleAll = (checked: boolean) => {
    setState(prevState => ({
      ...prevState,
      selectAll: checked,
      selectedReceipts: checked ? sortedReceipts.map(r => r.id) : [],
    }));
  };
  const toggleOne = (id: string) => {
    setState(prevState => {
      const has = prevState.selectedReceipts.includes(id);
      const next = has ? prevState.selectedReceipts.filter(x => x !== id) : [...prevState.selectedReceipts, id];
      return { ...prevState, selectedReceipts: next, selectAll: next.length === sortedReceipts.length };
    });
  };

  const handleDeleteConfirm = async () => {
    if (!state.selectedReceipt) return;
    try {
      setIsDeleting(true);
      const { error } = await supabase.from("receipts").delete().eq("id", state.selectedReceipt.id);
      if (error) throw error;
      setState(prevState => ({ ...prevState, receipts: prevState.receipts.filter(r => r.id !== state.selectedReceipt?.id), selectedReceipt: null }));
      toast.success(t("dashboard.deleted"));
    } catch (error: unknown) {
      console.error("Delete error:", error);
      toast.error(t("dashboard.deleteFailed"));
    } finally {
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (state.selectedReceipts.length === 0) {
      toast.error(t("dashboard.noSelection"));
      return;
    }
    try {
      setIsDeleting(true);
      await Promise.all(state.selectedReceipts.map(id => deleteReceiptMutation.mutateAsync(id)));
      setState(prevState => ({
        ...prevState,
        receipts: prevState.receipts.filter(r => !state.selectedReceipts.includes(r.id)),
        selectedReceipts: [],
        selectAll: false,
      }));
      toast.success(t("dashboard.deletedAll"));
    } catch (error: unknown) {
      console.error("Delete multiple error:", error);
      toast.error(t("dashboard.deleteFailed"));
    } finally {
      setIsDeleteDialogOpen(false);
      setIsDeleting(false);
    }
  };

  const exportData = (format: "csv" | "excel" | "json") => {
    if (state.selectedReceipts.length === 0) {
      toast.error(t("dashboard.noSelection"));
      return;
    }
    const selected = state.receipts.filter(r => state.selectedReceipts.includes(r.id));
    try {
      exportReceipts(format, selected, currency);
      toast.success(t("dashboard.exportSuccess", { format: format.toUpperCase() }));
    } catch (error) {
      console.error("Export error:", error);
      toast.error(t("dashboard.exportFailed", { format: format.toUpperCase() }));
    }
  };

  const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : "N/A");

  const setSearchTermAndResetPage = (value: string) => {
    setSearchTerm(value);
    setPage(1);
  };

  const setSortOrderAndResetPage = (value: "asc" | "desc") => {
    setSortOrder(value);
    setPage(1);
  };

  return {
    state, budget, isMobile,
    sortOrder, setSortOrder: setSortOrderAndResetPage, searchTerm, setSearchTerm: setSearchTermAndResetPage,
    page, setPage, totalPages, pageNumbers, paginatedReceipts,
    spentThisMonth, isDeleteDialogOpen, setIsDeleteDialogOpen, isDeleting,
    handleOpenDetailsModal, handleCloseDetailsModal, handleEditReceipt,
    handleReceiptUpdated, handleOpenDeleteDialog, handleCloseDeleteDialog,
    toggleAll, toggleOne, handleDeleteConfirm, handleDeleteAll, exportData, formatDate,
  };
};