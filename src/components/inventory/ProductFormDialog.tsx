import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import type { Product } from "@/types";

interface ProductFormDialogProps {
  product: Product | null;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (fields: { name: string; defaultUnit: string; lowStockThreshold: number | null }) => void;
}

const UNITS = ["pc", "kg", "g", "L", "mL", "box", "pack", "unit"];

/**
 * Create / edit a product. `product` null = create, otherwise edit.
 * Follows the AdjustStockDialog alert-dialog pattern.
 */
export const ProductFormDialog = ({ product, isOpen, isSubmitting, onClose, onSubmit }: ProductFormDialogProps) => {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [defaultUnit, setDefaultUnit] = useState("pc");
  const [lowStockThreshold, setLowStockThreshold] = useState("");

  useEffect(() => {
    if (isOpen) {
      setName(product?.name ?? "");
      setDefaultUnit(product?.defaultUnit ?? "pc");
      setLowStockThreshold(product?.lowStockThreshold != null ? String(product.lowStockThreshold) : "");
    }
  }, [isOpen, product]);

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const threshold = lowStockThreshold.trim() === "" ? null : Number(lowStockThreshold);
    onSubmit({ name: trimmed, defaultUnit, lowStockThreshold: threshold });
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{product ? t("inventory.editProduct") : t("inventory.addProduct")}</AlertDialogTitle>
          <AlertDialogDescription>{t("inventory.productFormDesc")}</AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="productName">{t("inventory.product")}</Label>
            <Input
              id="productName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t("inventory.productNamePlaceholder")}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productUnit">{t("inventory.unit")}</Label>
              <Select value={defaultUnit} onValueChange={setDefaultUnit}>
                <SelectTrigger id="productUnit" aria-label={t("inventory.unit")}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>{t(`inventory.unitNames.${u}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="productThreshold">{t("inventory.lowStockThreshold")}</Label>
              <Input
                id="productThreshold"
                type="number"
                step="0.001"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                placeholder={t("inventory.thresholdPlaceholder")}
              />
            </div>
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isSubmitting}>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleSubmit}
            disabled={isSubmitting || !name.trim()}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? t("common.loading") : t("common.save")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ProductFormDialog;