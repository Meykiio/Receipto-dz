import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Receipt, ReceiptItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReportDamage } from "@/hooks/queries";
import { toast } from "sonner";

interface DamagedItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  item: ReceiptItem;
  receipt: Receipt;
  onSuccess: (updatedReceipt: Receipt) => void;
}

export function DamagedItemForm({
  isOpen,
  onClose,
  item,
  receipt,
  onSuccess
}: DamagedItemFormProps) {
  const [damagedQuantity, setDamagedQuantity] = useState<number>(0);
  const [damageNotes, setDamageNotes] = useState<string>("");
  const [error, setError] = useState<string>("");
  const { t } = useTranslation();
  const reportDamage = useReportDamage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!item || !receipt) return;
    if (damagedQuantity < 1) {
      setError("Please enter a quantity of at least 1.");
      return;
    }
    if (damagedQuantity > item.quantity) {
      setError("Damaged quantity cannot exceed the purchased quantity.");
      return;
    }

    try {
      await reportDamage.mutateAsync({
        receiptId: receipt.id,
        receiptItemId: item.id,
        damagedQuantity,
        damageNotes,
      });
      toast.success(t("damaged.damageReported"));
      onSuccess(receipt);
      onClose();
      setDamagedQuantity(0);
      setDamageNotes("");
    } catch (err) {
      console.error('Error reporting damage:', err);
      setError("Failed to report damage. Please try again.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Damaged Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Item: <span className="font-medium text-foreground">{item.description}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Purchased quantity: <span className="font-medium text-foreground">{item.quantity}</span>
            </p>
          </div>

          <div>
            <Label htmlFor="damagedQuantity">Damaged Quantity</Label>
            <Input
              id="damagedQuantity"
              type="number"
              min="1"
              max={item.quantity}
              value={damagedQuantity}
              onChange={(e) => setDamagedQuantity(parseInt(e.target.value) || 0)}
              required
            />
          </div>

          <div>
            <Label htmlFor="damageNotes">Damage Notes (Optional)</Label>
            <Textarea
              id="damageNotes"
              value={damageNotes}
              onChange={(e) => setDamageNotes(e.target.value)}
              placeholder={t("a11y.describeDamage")}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={reportDamage.isPending}>
              {reportDamage.isPending ? "Reporting..." : "Report Damage"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
