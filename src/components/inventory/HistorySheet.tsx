import { useTranslation } from "react-i18next";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface StockMovement {
  id: string | number;
  reason: string;
  note: string | null;
  delta: number;
  createdAt: string;
}

const REASON_LABELS: Record<string, string> = {
  purchase: "inventory.reasonPurchase",
  damage: "inventory.reasonDamage",
  manual_in: "inventory.reasonAdded",
  manual_out: "inventory.reasonRemoved",
  correction: "inventory.reasonCorrection",
};

interface HistorySheetProps {
  product: { id: string; name: string } | null;
  history: StockMovement[];
  onClose: () => void;
}

/**
 * Per-product movement history in the design system sheet shell.
 */
export const HistorySheet = ({ product, history, onClose }: HistorySheetProps) => {
  const { t } = useTranslation();
  return (
    <Sheet open={!!product} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:w-[480px]">
        <SheetHeader>
          <SheetTitle>{product?.name} — {t("inventory.history")}</SheetTitle>
        </SheetHeader>
        <div className="space-y-3 p-4">
          {history.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">{t("inventory.noMovements")}</p>
          ) : (
            history.map((movement) => (
              <div key={movement.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{t(REASON_LABELS[movement.reason] ?? movement.reason)}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(movement.createdAt).toLocaleString()}
                    {movement.note ? ` — ${movement.note}` : ""}
                  </p>
                </div>
                <span className={`font-semibold ${movement.delta > 0 ? "text-positive" : "text-destructive"}`}>
                  {movement.delta > 0 ? "+" : ""}{movement.delta}
                </span>
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};