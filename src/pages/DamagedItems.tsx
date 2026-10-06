import { useState } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DamagedItem } from "@/types";
import { useDamagedItemsBySupplier, useDeleteDamagedItem } from "@/hooks/queries";
import { toast } from "sonner";
import { Trash2, FileText, Search } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { RefundSummaryReport } from "@/components/damaged/RefundSummaryReport";

export default function DamagedItems() {
  const { t } = useTranslation();
  const { data: supplierGroups = [], isLoading } = useDamagedItemsBySupplier();
  const deleteMutation = useDeleteDamagedItem();

  const [deleteItem, setDeleteItem] = useState<DamagedItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [damageFilter, setDamageFilter] = useState("all");

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setIsDeleting(true);
      await deleteMutation.mutateAsync(deleteItem.id);
      toast.success(t("damaged.removed"));
      setDeleteItem(null);
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error(t("damaged.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSupplierGroups = supplierGroups.filter((group) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const supplierMatches = group.supplierName.toLowerCase().includes(query);
      const itemMatches = group.damagedItems.some((item) =>
        item.itemDescription.toLowerCase().includes(query) ||
        (item.damageNotes && item.damageNotes.toLowerCase().includes(query))
      );
      if (!supplierMatches && !itemMatches) return false;
    }
    if (damageFilter === "all") return true;
    if (damageFilter === "high") {
      return group.damagedItems.some((item) =>
        item.originalQuantity > 0 && (item.damagedQuantity / item.originalQuantity) > 0.5
      );
    }
    if (damageFilter === "low") {
      return group.damagedItems.every((item) =>
        item.originalQuantity === 0 || (item.damagedQuantity / item.originalQuantity) <= 0.5
      );
    }
    return true;
  });

  const thClass = "text-[11px] font-semibold uppercase tracking-[0.08em] text-primary";

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <PageHeader title={t("damaged.title")} description={t("damaged.subtitle")}>
          <div className="flex w-full gap-2 md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder={t("damaged.search")} className="ps-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
            <Select value={damageFilter} onValueChange={setDamageFilter}>
              <SelectTrigger className="w-[180px]" aria-label="Filter damaged items">
                <SelectValue placeholder={t("damaged.filterByDamage")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("damaged.allItems")}</SelectItem>
                <SelectItem value="high">{t("damaged.highDamage")}</SelectItem>
                <SelectItem value="low">{t("damaged.lowDamage")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </PageHeader>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse rounded-lg border border-border bg-card p-4">
                <div className="h-6 w-2/3 rounded bg-muted" />
                <div className="mt-3 h-4 w-full rounded bg-muted" />
                <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : filteredSupplierGroups.length === 0 ? (
          <div className="flex flex-col items-center rounded-xl border border-dashed border-outline-hi bg-card px-4 py-16 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg border border-toggle bg-primary/5 text-primary">
              <FileText className="h-6 w-6" />
            </div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              {searchQuery ? t("damaged.noMatch") : t("damaged.noItems")}
            </h2>
            <p className="mt-1 max-w-[380px] text-sm leading-relaxed text-muted-foreground">
              {searchQuery ? t("damaged.noMatchDesc") : t("damaged.noItemsDesc")}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredSupplierGroups.map((group) => {
              const count = group.damagedItems.length;
              const itemCountLabel = count === 1 ? t("damaged.damagedItemCount") : t("damaged.damagedItemsCount");
              return (
                <Card key={group.supplierName}>
                  <CardHeader>
                    <CardTitle>{group.supplierName}</CardTitle>
                    <CardDescription>{count} {itemCountLabel}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="items">
                        <AccordionTrigger>{t("damaged.viewItems")}</AccordionTrigger>
                        <AccordionContent>
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted">
                                <TableHead className={thClass}>{t("damaged.item")}</TableHead>
                                <TableHead className={`${thClass} text-right`}>{t("damaged.originalQty")}</TableHead>
                                <TableHead className={`${thClass} text-right`}>{t("damaged.damagedQty")}</TableHead>
                                <TableHead className={`${thClass} text-right`}>{t("damaged.actualQty")}</TableHead>
                                <TableHead className={thClass}>{t("damaged.notes")}</TableHead>
                                <TableHead></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {group.damagedItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="text-foreground">{item.itemDescription}</TableCell>
                                  <TableCell className="text-right text-foreground">{item.originalQuantity}</TableCell>
                                  <TableCell className="text-right text-destructive">{item.damagedQuantity}</TableCell>
                                  <TableCell className="text-right text-foreground">{item.actualQuantity}</TableCell>
                                  <TableCell className="text-foreground">{item.damageNotes || "N/A"}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                      aria-label={t("a11y.deleteDamagedItem")}
                                      onClick={() => setDeleteItem(item)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </CardContent>
                  <CardFooter>
                    <Sheet open={selectedSupplier === group.supplierName} onOpenChange={(open) => !open && setSelectedSupplier(null)}>
                      <Button onClick={() => setSelectedSupplier(group.supplierName)}>
                        {t("damaged.refundSummary")}
                      </Button>
                      <SheetContent side="right" className="w-full overflow-y-auto sm:w-[540px]">
                        {/* The report renders its own title, so the drawer heading is
                            hidden on paper to avoid printing the heading twice. */}
                        <SheetHeader className="print:hidden">
                          <SheetTitle>{t("damaged.refundTitle")}</SheetTitle>
                        </SheetHeader>
                        {selectedSupplier === group.supplierName && (
                          <RefundSummaryReport supplierName={group.supplierName} items={group.damagedItems} />
                        )}
                      </SheetContent>
                    </Sheet>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("damaged.deleteConfirm")}</AlertDialogTitle>
            <AlertDialogDescription>{t("damaged.deleteConfirmDesc")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? t("damaged.deleting") : t("common.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}