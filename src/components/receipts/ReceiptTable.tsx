import { Checkbox } from "@/components/ui/checkbox";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Trash2, ReceiptText } from "lucide-react";
import { Receipt } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { useReceiptImageUrl } from "@/hooks/queries";

function ReceiptImage({ path }: { path: string | null }) {
  const { t } = useTranslation();
  const { data: url } = useReceiptImageUrl(path);
  if (!url) {
    return (
      <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground">
        <ReceiptText className="h-5 w-5" />
      </div>
    );
  }
  return (
    <div className="relative h-11 w-11 overflow-hidden rounded-md">
      <img src={url} alt={t("a11y.receiptImage")} className="h-full w-full object-cover" />
    </div>
  );
}

interface ReceiptTableProps {
  receipts: Receipt[];
  selectedIds: string[];
  selectAll: boolean;
  currency?: string;
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (id: string) => void;
  onOpen: (receipt: Receipt) => void;
  onDelete: (receipt: Receipt) => void;
  formatDate: (iso: string | null) => string;
  labelImage: string;
  labelVendor: string;
  labelUploadDate: string;
  labelReceiptDate: string;
  labelTotal: string;
  labelActions: string;
  labelView: string;
}

/**
 * Receipts list per the design system: emerald-header table on desktop
 * (tabular numbers, row hover, status visible), collapsing to receipt-row
 * cards on mobile.
 */
export const ReceiptTable = ({
  receipts, selectedIds, selectAll, currency,
  onToggleAll, onToggleOne, onOpen, onDelete, formatDate,
  labelImage, labelVendor, labelUploadDate, labelReceiptDate, labelTotal, labelActions, labelView,
}: ReceiptTableProps) => {
  const { t } = useTranslation();

  const rowClass = "cursor-pointer hover:bg-muted/50";
  const thClass = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-primary";
  const tdClass = "px-4 py-3 whitespace-nowrap text-foreground";

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="min-w-full border-collapse">
          <thead className="bg-muted">
            <tr>
              <th className={thClass}>
                <Checkbox checked={selectAll} onCheckedChange={(c) => onToggleAll(Boolean(c))} aria-label={t("a11y.selectAllReceipts")} />
              </th>
              <th className={thClass}>{labelImage}</th>
              <th className={thClass}>{labelVendor}</th>
              <th className={thClass}>{labelUploadDate}</th>
              <th className={thClass}>{labelReceiptDate}</th>
              <th className={`${thClass} text-right`}>{labelTotal}</th>
              <th className={`${thClass} text-right`}>{labelActions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {receipts.map((receipt) => {
              const checked = selectedIds.includes(receipt.id);
              return (
                <tr key={receipt.id} onClick={() => onOpen(receipt)} className={rowClass}>
                  <td className={tdClass} onClick={(e) => e.stopPropagation()}>
                    <Checkbox checked={checked} onCheckedChange={() => onToggleOne(receipt.id)} aria-label={t("a11y.selectReceipt", { vendor: receipt.vendorName })} />
                  </td>
                  <td className={tdClass}><ReceiptImage path={receipt.imagePath} /></td>
                  <td className={`${tdClass} font-medium`}>{receipt.vendorName || "N/A"}</td>
                  <td className={`${tdClass} text-muted-foreground`}>{formatDate(receipt.createdAt)}</td>
                  <td className={`${tdClass} text-muted-foreground`}>{formatDate(receipt.receiptDate)}</td>
                  <td className={`${tdClass} text-right font-semibold text-primary`}>{formatCurrency(receipt.total, currency)}</td>
                  <td className={`${tdClass} text-right`}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" aria-label={t("a11y.deleteReceipt")} onClick={(e) => { e.stopPropagation(); onDelete(receipt); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onOpen(receipt); }}>
                        {labelView}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile receipt-row cards */}
      <div className="flex flex-col gap-2.5 md:hidden">
        {receipts.map((receipt) => (
          <div
            key={receipt.id}
            onClick={() => onOpen(receipt)}
            className="flex cursor-pointer items-center gap-3.5 rounded-lg border border-border bg-card p-4 transition-all duration-fast ease-out hover:-translate-y-[2px] hover:border-outline-hi hover:shadow-sm"
          >
            <ReceiptImage path={receipt.imagePath} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-foreground">{receipt.vendorName || "N/A"}</div>
              <div className="truncate text-xs text-muted-foreground">
                {formatDate(receipt.receiptDate)} · {receipt.items?.length ?? 0} items
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-display text-base font-bold text-primary">{formatCurrency(receipt.total, currency)}</span>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" aria-label={t("a11y.deleteReceipt")} onClick={(e) => { e.stopPropagation(); onDelete(receipt); }}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};