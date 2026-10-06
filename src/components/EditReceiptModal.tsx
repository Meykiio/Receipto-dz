import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Receipt, ReceiptItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { updateReceipt } from "@/services/receiptService";
import { toast } from "sonner";

interface EditReceiptModalProps {
  receipt: Receipt | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedReceipt: Receipt) => void;
}

export function EditReceiptModal({ receipt, isOpen, onClose, onSave }: EditReceiptModalProps) {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    if (receipt) {
      setEditedReceipt(JSON.parse(JSON.stringify(receipt)));
    }
  }, [receipt, isOpen]);

  if (!editedReceipt) return null;

  const handleInputChange = (field: 'vendorName' | 'receiptDate' | 'paymentMethod' | 'documentType', value: string) => {
    setEditedReceipt(prev => {
      if (!prev) return prev;
      return { ...prev, [field]: value };
    });
  };

  const handleItemChange = (index: number, field: keyof ReceiptItem, value: string | number | null) => {
    setEditedReceipt(prev => {
      if (!prev || !prev.items) return prev;

      const updatedItems = [...prev.items];
      if (!updatedItems[index]) {
        updatedItems[index] = {} as ReceiptItem;
      }

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: field === 'description' ? value : Number(value)
      };

      return { ...prev, items: updatedItems };
    });
  };

  const handleSave = async () => {
    if (!editedReceipt) return;

    try {
      setIsLoading(true);

      const updatedItems = editedReceipt.items?.map(item => ({
        ...item,
        unitPrice: item.unitPrice
      })) || [];

      const subtotal = updatedItems.reduce((sum, item) => sum + (item.unitPrice || 0), 0);
      const taxAmount = editedReceipt.tax || 0;
      const totalAmount = subtotal + taxAmount;

      const finalReceipt = {
        ...editedReceipt,
        items: updatedItems,
        total: totalAmount
      };

      const updatedReceipt = await updateReceipt(finalReceipt);
      onSave(updatedReceipt);
      toast.success(t("review.receiptUpdated"));
      onClose();
    } catch (error) {
      console.error("Error updating receipt:", error);
      toast.error(t("review.updateFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="w-full max-w-[98vw] h-[98vh] flex flex-col p-2 rounded-t-2xl bottom-0 fixed left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-900 overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-center">Edit Receipt</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2 mt-2">
            <Label htmlFor="vendorName">Vendor Name</Label>
            <Input
              id="vendorName"
              value={editedReceipt.vendorName || ''}
              onChange={(e) => handleInputChange('vendorName', e.target.value)}
            />
            <Label htmlFor="receiptDate">Date</Label>
            <Input
              id="receiptDate"
              type="date"
              value={editedReceipt.receiptDate || ''}
              onChange={(e) => handleInputChange('receiptDate', e.target.value)}
            />
          </div>
          <Separator className="my-2" />
          <div>
            <h3 className="text-base font-semibold mb-1">Items</h3>
            <ul className="divide-y divide-border bg-muted rounded-md">
              {(editedReceipt.items || []).map((item, idx) => (
                <li key={idx} className="py-2 px-1 flex flex-col gap-1">
                  <Input
                    value={item.description || ''}
                    onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.quantity || 0}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Qty"
                      className="w-1/2"
                    />
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice || 0}
                      onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value ? parseFloat(e.target.value) : null)}
                      placeholder="Price"
                      className="w-1/2"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <Separator className="my-2" />
          <div className="flex flex-col gap-2 mt-auto pb-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading} className="w-full">
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading} className="w-full">
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader className="flex-none">
          <DialogTitle className="text-xl font-bold">
            Edit Receipt
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="overflow-x-auto w-full touch-pan-x">
            <div className="space-y-6 p-1 px-2 md:px-6 pe-4 md:pe-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendorName">Vendor Name</Label>
                  <Input
                    id="vendorName"
                    value={editedReceipt.vendorName || ''}
                    onChange={(e) => handleInputChange('vendorName', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="documentType">Document Type</Label>
                  <Input
                    id="documentType"
                    value={editedReceipt.documentType || ''}
                    onChange={(e) => handleInputChange('documentType', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receiptDate">{t("a11y.receiptDate")}</Label>
                  <Input
                    id="receiptDate"
                    type="date"
                    value={editedReceipt.receiptDate || ''}
                    onChange={(e) => handleInputChange('receiptDate', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <Input
                    id="paymentMethod"
                    value={editedReceipt.paymentMethod || ''}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="text-lg font-medium mb-2">Items</h3>
                <div className="border rounded-md w-full">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editedReceipt.items && editedReceipt.items.length > 0 ? (
                        editedReceipt.items.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <Input
                                value={item.description || ''}
                                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.quantity || 0}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-20 ml-auto"
                              />
                            </TableCell>
                            <TableCell className="text-right">
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.unitPrice || 0}
                                onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value ? parseFloat(e.target.value) : null)}
                                className="w-24 ml-auto"
                              />
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {((item.quantity || 0) * (item.unitPrice || 0)).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">No items found</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxAmount">Tax Amount</Label>
                  <Input
                    id="taxAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={editedReceipt.tax || 0}
                    onChange={(e) => setEditedReceipt(prev => prev ? { ...prev, tax: e.target.value ? parseFloat(e.target.value) : 0 } : prev)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Total (auto-calculated)</Label>
                  <Input
                    readOnly
                    value={(() => {
                      const subtotal = (editedReceipt.items || []).reduce((sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
                      return (subtotal + (editedReceipt.tax || 0)).toFixed(2);
                    })()}
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="h-4"></div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
