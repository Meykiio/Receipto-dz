import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { StockItem } from "@/types";

interface AdjustStockDialogProps {
  product: StockItem | null;
  delta: string;
  reason: "manual_in" | "manual_out" | "correction";
  note: string;
  isSubmitting: boolean;
  onDeltaChange: (v: string) => void;
  onReasonChange: (v: "manual_in" | "manual_out" | "correction") => void;
  onNoteChange: (v: string) => void;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Adjust-stock dialog per the design system form pattern.
 */
export const AdjustStockDialog = ({
  product, delta, reason, note, isSubmitting,
  onDeltaChange, onReasonChange, onNoteChange, onClose, onConfirm,
}: AdjustStockDialogProps) => {
  const { t } = useTranslation();
  return (
    <AlertDialog open={!!product} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("inventory.adjustTitle")} — {product?.name}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("inventory.currentQty")}: {product?.quantity} {product?.defaultUnit}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="adjustDelta">{t("inventory.change")}</Label>
            <Input
              id="adjustDelta"
              type="number"
              step="0.001"
              value={delta}
              onChange={(e) => onDeltaChange(e.target.value)}
              placeholder={t("inventory.changePlaceholder")}
            />
          </div>
          <div className="space-y-2">
            <Label>{t("inventory.reason")}</Label>
            <Select value={reason} onValueChange={(v) => onReasonChange(v as typeof reason)}>
              <SelectTrigger aria-label={t("inventory.reason")}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual_in">{t("inventory.reasonAdded")}</SelectItem>
                <SelectItem value="manual_out">{t("inventory.reasonRemoved")}</SelectItem>
                <SelectItem value="correction">{t("inventory.reasonCorrection")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adjustNote">{t("inventory.note")}</Label>
            <Input id="adjustNote" value={note} onChange={(e) => onNoteChange(e.target.value)} placeholder={t("inventory.notePlaceholder")} />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isSubmitting}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? t("common.loading") : t("common.save")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};