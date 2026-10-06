import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { History, TrendingUp, Pencil, Trash2 } from "lucide-react";
import StatusChip from "@/components/StatusChip";
import type { StockItem } from "@/types";
import type { StockStatus } from "@/pages/Inventory";

interface StockCardsProps {
  items: StockItem[];
  onHistory: (item: StockItem) => void;
  onAdjust: (item: StockItem) => void;
  onEdit: (item: StockItem) => void;
  onDelete: (item: StockItem) => void;
}

/**
 * Mobile product cards per the design doc: dense tables collapse into
 * receipt-row style cards on small screens.
 */
export const StockCards = ({ items, onHistory, onAdjust, onEdit, onDelete }: StockCardsProps) => {
  const { t } = useTranslation();
  const status = (item: StockItem): StockStatus => {
    if (item.quantity <= 0) return "out";
    if (item.lowStockThreshold != null && item.quantity <= item.lowStockThreshold) return "low";
    return "ok";
  };

  return (
    <div className="flex flex-col gap-2.5 md:hidden">
      {items.map((item) => {
        const s = status(item);
        const tone = s === "ok" ? "positive" : s === "low" ? "secondary" : "error";
        const label = s === "ok" ? t("inventory.inStock") : s === "low" ? t("inventory.low") : t("inventory.out");
        return (
          <div key={item.id} className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{item.name}</div>
              <div className="mt-1 flex items-center gap-2">
                <StatusChip tone={tone} label={label} />
                <span className={`text-sm font-bold ${s === "low" ? "text-secondary" : s === "out" ? "text-destructive" : "text-foreground"}`}>
                  {item.quantity} {item.defaultUnit}
                </span>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button variant="ghost" size="sm" onClick={() => onHistory(item)} aria-label={t("inventory.history")} title={t("inventory.history")}>
                <History className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAdjust(item)}
                aria-label={t("inventory.adjustStock")}
                title={t("inventory.adjustStock")}
              >
                <TrendingUp className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => onEdit(item)} aria-label={t("inventory.editProduct")} title={t("inventory.editProduct")}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(item)}
                aria-label={t("inventory.deleteProductTitle")}
                title={t("inventory.deleteProductTitle")}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};