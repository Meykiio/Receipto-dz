import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInventory, useProductHistory, useAdjustStock, useCreateProduct, useUpdateProduct, useDeleteProduct } from "@/hooks/queries";
import type { StockItem } from "@/types";
import { toast } from "sonner";
import { Package, Search, TrendingUp, History, Pencil, Trash2, Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import StatusChip from "@/components/StatusChip";
import { AdjustStockDialog } from "@/components/inventory/AdjustStockDialog";
import { HistorySheet } from "@/components/inventory/HistorySheet";
import { StockCards } from "@/components/inventory/StockCards";
import { ProductFormDialog } from "@/components/inventory/ProductFormDialog";
import { DeleteProductDialog } from "@/components/inventory/DeleteProductDialog";
import { ReceiptPagination } from "@/components/receipts/ReceiptPagination";
import { getPageNumbers } from "@/lib/utils";

export type StockStatus = "ok" | "low" | "out";

const ITEMS_PER_PAGE = 10;

const getStockStatus = (item: StockItem): StockStatus => {
  if (item.quantity <= 0) return "out";
  if (item.lowStockThreshold != null && item.quantity <= item.lowStockThreshold) return "low";
  return "ok";
};

export default function Inventory() {
  const { t } = useTranslation();
  const { data: items = [], isLoading } = useInventory();
  const adjustStock = useAdjustStock();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<StockItem | null>(null);
  const [adjustProduct, setAdjustProduct] = useState<StockItem | null>(null);
  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustReason, setAdjustReason] = useState<"manual_in" | "manual_out" | "correction">("manual_in");
  const [adjustNote, setAdjustNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formProduct, setFormProduct] = useState<StockItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteProductTarget, setDeleteProductTarget] = useState<StockItem | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: history = [] } = useProductHistory(selectedProduct?.id ?? null);

  const filtered = items.filter((item) => {
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (statusFilter === "low") return getStockStatus(item) === "low";
    if (statusFilter === "out") return getStockStatus(item) === "out";
    return true;
  });

  const lowCount = items.filter((i) => getStockStatus(i) !== "ok").length;

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageNumbers = getPageNumbers(page, totalPages);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const onSearchChange = (v: string) => { setSearchQuery(v); setPage(1); };
  const onFilterChange = (v: string) => { setStatusFilter(v); setPage(1); };

  const handleAdjust = async () => {
    if (!adjustProduct) return;
    const delta = parseFloat(adjustDelta);
    if (isNaN(delta) || delta === 0) {
      toast.error(t("inventory.nonzeroQty"));
      return;
    }
    if (adjustReason === "manual_out" && delta > 0) {
      toast.error(t("inventory.removalNegative"));
      return;
    }
    if (adjustReason === "manual_in" && delta < 0) {
      toast.error(t("inventory.additionPositive"));
      return;
    }
    setIsSubmitting(true);
    try {
      await adjustStock.mutateAsync({ productId: adjustProduct.id, delta, reason: adjustReason, note: adjustNote || null });
      toast.success(t("inventory.stockUpdated"));
      setAdjustProduct(null);
      setAdjustDelta("");
      setAdjustNote("");
    } catch (error) {
      console.error("Adjust error:", error);
      toast.error(t("inventory.stockUpdateFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const openCreate = () => {
    setFormProduct(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: StockItem) => {
    setFormProduct(item);
    setIsFormOpen(true);
  };

  const openDelete = (item: StockItem) => {
    setDeleteProductTarget(item);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (fields: { name: string; defaultUnit: string; lowStockThreshold: number | null }) => {
    setIsSubmitting(true);
    try {
      if (formProduct) {
        await updateProduct.mutateAsync({
          productId: formProduct.id,
          name: fields.name,
          defaultUnit: fields.defaultUnit,
          lowStockThreshold: fields.lowStockThreshold,
        });
        toast.success(t("inventory.productUpdated"));
      } else {
        await createProduct.mutateAsync({ name: fields.name, defaultUnit: fields.defaultUnit, lowStockThreshold: fields.lowStockThreshold });
        toast.success(t("inventory.productCreated"));
      }
      setIsFormOpen(false);
      setFormProduct(null);
    } catch (error) {
      console.error("Save product error:", error);
      toast.error(t("inventory.productSaveFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProductTarget) return;
    setIsSubmitting(true);
    try {
      await deleteProduct.mutateAsync(deleteProductTarget.id);
      toast.success(t("inventory.productDeleted"));
      setIsDeleteOpen(false);
      setDeleteProductTarget(null);
    } catch (error) {
      console.error("Delete product error:", error);
      toast.error(t("inventory.productDeleteFailed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const thClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-primary";

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <PageHeader
          title={t("inventory.title")}
          description={`${items.length} ${t("inventory.summary")}${lowCount > 0 ? ` — ${lowCount} ${t("inventory.needAttention")}` : ""}`}
        >
          <div className="flex w-full flex-wrap gap-2 md:w-auto md:flex-nowrap md:items-center md:justify-end">
            <Button onClick={openCreate} className="w-full md:w-auto">
              <Plus className="h-4 w-4 me-2" />
              {t("inventory.addProduct")}
            </Button>
            <div className="relative w-full md:w-64">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("inventory.searchProducts")}
                className="ps-8"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={onFilterChange}>
              <SelectTrigger className="w-full md:w-[150px]" aria-label="Filter inventory">
                <SelectValue placeholder={t("inventory.filter")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("inventory.all")}</SelectItem>
                <SelectItem value="low">{t("inventory.lowStock")}</SelectItem>
                <SelectItem value="out">{t("inventory.outOfStock")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageHeader>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-border bg-card p-4">
                <div className="h-5 w-2/3 rounded bg-muted" />
                <div className="mt-3 h-4 w-1/2 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-outline-hi bg-card px-4 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-toggle bg-primary/5 text-primary">
              <Package className="h-6 w-6" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {items.length === 0 ? t("inventory.empty") : t("inventory.noMatch")}
            </h2>
            <p className="mt-1 max-w-[380px] text-sm leading-relaxed text-muted-foreground">
              {items.length === 0 ? t("inventory.emptyDesc") : t("inventory.noMatchDesc")}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className={thClass}>{t("inventory.product")}</TableHead>
                    <TableHead className={`${thClass} text-right`}>{t("inventory.quantity")}</TableHead>
                    <TableHead className={`${thClass} text-right`}>{t("inventory.alertAt")}</TableHead>
                    <TableHead className={thClass}>{t("inventory.status")}</TableHead>
                    <TableHead className={`${thClass} text-right`}>{t("inventory.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginated.map((item) => {
                    const status = getStockStatus(item);
                    const tone = status === "ok" ? "positive" : status === "low" ? "secondary" : "error";
                    const label = status === "ok" ? t("inventory.inStock") : status === "low" ? t("inventory.low") : t("inventory.out");
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                        <TableCell className={`text-right font-bold ${status === "low" ? "text-secondary" : status === "out" ? "text-destructive" : "text-foreground"}`}>
                          {item.quantity} {item.defaultUnit}
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">
                          {item.lowStockThreshold ?? "—"}
                        </TableCell>
                        <TableCell>
                          <StatusChip tone={tone} label={label} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedProduct(item)} aria-label={t("inventory.history")} title={t("inventory.history")}>
                              <History className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setAdjustProduct(item)}
                              aria-label={t("inventory.adjustStock")}
                              title={t("inventory.adjustStock")}
                            >
                              <TrendingUp className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => openEdit(item)} aria-label={t("inventory.editProduct")} title={t("inventory.editProduct")}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDelete(item)}
                              aria-label={t("inventory.deleteProductTitle")}
                              title={t("inventory.deleteProductTitle")}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile product cards (design doc: dense tables collapse to cards) */}
            <StockCards items={paginated} onHistory={setSelectedProduct} onAdjust={setAdjustProduct} onEdit={openEdit} onDelete={openDelete} />

            <ReceiptPagination
              page={page}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
              onPage={setPage}
              labelPrevious={t("common.previous")}
              labelNext={t("common.next")}
            />
          </>
        )}
      </div>

      <HistorySheet product={selectedProduct} history={history} onClose={() => setSelectedProduct(null)} />

      <AdjustStockDialog
        product={adjustProduct}
        delta={adjustDelta}
        reason={adjustReason}
        note={adjustNote}
        isSubmitting={isSubmitting}
        onDeltaChange={setAdjustDelta}
        onReasonChange={setAdjustReason}
        onNoteChange={setAdjustNote}
        onClose={() => setAdjustProduct(null)}
        onConfirm={handleAdjust}
      />

      <ProductFormDialog
        product={formProduct}
        isOpen={isFormOpen}
        isSubmitting={isSubmitting}
        onClose={() => { setIsFormOpen(false); setFormProduct(null); }}
        onSubmit={handleFormSubmit}
      />

      <DeleteProductDialog
        open={isDeleteOpen}
        productName={deleteProductTarget?.name ?? ""}
        isDeleting={isSubmitting}
        onClose={() => { setIsDeleteOpen(false); setDeleteProductTarget(null); }}
        onConfirm={handleDeleteConfirm}
      />
    </AppLayout>
  );
}