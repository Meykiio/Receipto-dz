import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Receipt, ReceiptItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/utils";
import { Trash2, AlertTriangle } from "lucide-react";
import { deleteReceipt } from "@/services/receiptService";
import { toast } from "sonner";
import { DamagedItemForm } from "./DamagedItemForm";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { useReceiptImageUrl } from "@/hooks/queries";

interface ReceiptDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt;
  onReceiptUpdated: (receipt: Receipt) => void;
  onEdit?: (receipt: Receipt) => void;
}

export default function ReceiptDetailsModal({
  isOpen,
  onClose,
  receipt,
  onReceiptUpdated,
  onEdit
}: ReceiptDetailsModalProps) {
  const { t } = useTranslation();
  const { userSettings } = useUserSettings();
  const { data: imageUrl } = useReceiptImageUrl(receipt.imagePath);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReceiptItem | null>(null);

  if (!receipt) return null;

  const receiptDate = receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : "N/A";
  const processingDate = receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : "N/A";

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!receipt) return;

    try {
      setIsDeleting(true);
      await deleteReceipt(receipt.id);
      toast.success(t("dashboard.receiptDeleted"));
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error) {
      console.error("Error deleting receipt:", error);
      toast.error(t("dashboard.deleteFailed"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{t("receiptDetails.title")}</DialogTitle>
          </DialogHeader>

          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(80vh - 120px)' }}>
            <div className="space-y-6 p-4">
              {imageUrl && (
                <div className="mb-4">
                  <Button
                    variant="default"
                    onClick={() => window.open(imageUrl, '_blank')}
                    className="w-full flex items-center justify-center gap-2 py-6 bg-brand-blue hover:bg-brand-lightBlue"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M9 15h6" />
                      <path d="M9 11h6" />
                    </svg>
                    <span className="text-lg font-medium">{t("receiptDetails.viewReceipt")}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-external-link">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </Button>
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("review.vendor")}</p>
                  <p className="text-lg">{receipt.vendorName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("a11y.receiptDate")}</p>
                  <p className="text-lg">{receiptDate}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{t("receiptDetails.processingDate")}</p>
                  <p className="text-lg">{processingDate}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("damaged.item")}</TableHead>
                      <TableHead className="text-right">{t("inventory.quantity")}</TableHead>
                      <TableHead className="text-right">{t("receiptDetails.unitPrice")}</TableHead>
                      <TableHead className="text-right">{t("review.total")}</TableHead>
                      <TableHead className="text-right">{t("receiptDetails.damagedCol")}</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receipt.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice || 0, userSettings?.currency)}</TableCell>
                        <TableCell className="text-right">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0), userSettings?.currency)}</TableCell>
                        <TableCell className="text-right">{item.damagedQuantity || 0}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedItem(item)}
                            className="flex items-center gap-1"
                          >
                            <AlertTriangle className="h-4 w-4" />
                            {t("receiptDetails.reportDamage")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("review.tax")}</span>
                  <span>{formatCurrency(receipt.tax || 0, userSettings?.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>{t("review.total")}</span>
                  <span>{formatCurrency(receipt.total || 0, userSettings?.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <div className="flex items-center gap-2">
              {onEdit && (
                <Button variant="outline" size="sm" onClick={() => onEdit(receipt)}>
                  {t("receiptDetails.editReceipt")}
                </Button>
              )}
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 me-2" />
                {t("receiptDetails.deleteReceipt")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this receipt?</AlertDialogTitle>
            <AlertDialogDescription>
              {t("receiptDetails.deleteConfirmDesc")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {selectedItem && receipt && (
        <DamagedItemForm
          receipt={receipt}
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onSuccess={() => {
            setSelectedItem(null);
            onReceiptUpdated(receipt);
          }}
        />
      )}
    </>
  );
}
