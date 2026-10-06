import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer } from "lucide-react";

interface DamagedItem {
  id: string;
  itemDescription: string;
  originalQuantity: number;
  damagedQuantity: number;
  actualQuantity: number;
  damageNotes: string | null;
}

interface RefundSummaryReportProps {
  supplierName: string;
  items: DamagedItem[];
}

/**
 * Print-ready refund request summary per the design system review-paper layout.
 */
export const RefundSummaryReport = ({ supplierName, items }: RefundSummaryReportProps) => {
  const { t } = useTranslation();
  const totalItems = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.damagedQuantity, 0);
  const today = new Date().toLocaleDateString();

  return (
    <div className="space-y-6 p-4">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-foreground">{t("damaged.refundTitle")}</h2>
        <p className="text-muted-foreground">{t("damaged.generatedOn")} {today}</p>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium text-foreground">{t("damaged.supplierInfo")}</h3>
        <p className="text-foreground"><strong>{t("damaged.supplierName")}:</strong> {supplierName}</p>
      </div>

      <Separator />

      <div>
        <h3 className="mb-2 font-medium text-foreground">{t("damaged.item")}</h3>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">{t("damaged.item")}</TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">{t("damaged.originalQty")}</TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">{t("damaged.damagedQty")}</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary">{t("damaged.notes")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="text-foreground">{item.itemDescription}</TableCell>
                <TableCell className="text-right text-foreground">{item.originalQuantity}</TableCell>
                <TableCell className="text-right text-destructive">{item.damagedQuantity}</TableCell>
                <TableCell className="text-foreground">{item.damageNotes || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="font-medium text-foreground">{t("damaged.summary")}</h3>
        <p className="text-foreground"><strong>{t("damaged.totalItemsIssues")}:</strong> {totalItems}</p>
        <p className="text-foreground"><strong>{t("damaged.totalDamagedQty")}:</strong> {totalQty}</p>
      </div>

      <div className="mt-8 border-t pt-4 text-foreground">{t("damaged.refundRequestText")}</div>

      <div className="mt-8 flex justify-center">
        <Button onClick={() => window.print()} className="gap-2 bg-primary hover:bg-primary/90">
          <Printer className="h-4 w-4" />
          {t("damaged.printReport")}
        </Button>
      </div>
    </div>
  );
};