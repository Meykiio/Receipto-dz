import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import type { Receipt } from '../types';
import { formatCurrency } from '@/lib/utils';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { ScrollArea } from './ui/scroll-area';
import { AlertTriangle } from 'lucide-react';
import { DamagedItemForm } from "./DamagedItemForm";

interface MobileReceiptDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt | null;
  onEdit: (receipt: Receipt) => void;
  onReceiptUpdated: (updatedReceipt: Receipt) => void;
}

const MobileReceiptDetailsModal: React.FC<MobileReceiptDetailsModalProps> = ({
  isOpen,
  onClose,
  receipt,
  onEdit,
  onReceiptUpdated
}) => {
  const { t } = useTranslation();
  const { userSettings } = useUserSettings();
  const [selectedItem, setSelectedItem] = React.useState<number | null>(null);

  if (!receipt) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] flex flex-col">
        <SheetHeader>
          <SheetTitle>{t("receiptDetails.title")}</SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-6 p-4">
            {receipt.imagePath && (
              <div className="mb-4">
                <Button
                  variant="default"
                  onClick={() => window.open(receipt.imagePath || '', '_blank')}
                  className="w-full flex items-center justify-center gap-2 py-6 bg-brand-blue hover:bg-brand-lightBlue"
                >
                  <span className="text-lg font-medium">{t("receiptDetails.viewReceipt")}</span>
                </Button>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("review.vendor")}</p>
                <p className="text-lg">{receipt.vendorName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("a11y.receiptDate")}</p>
                <p className="text-lg">
                  {receipt.receiptDate ? new Date(receipt.receiptDate).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("receiptDetails.processingDate")}</p>
                <p className="text-lg">{receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-base font-semibold mb-2">{t("review.items")}</h3>
              {receipt.items.length > 0 ?
                receipt.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity}x @ {formatCurrency(item.unitPrice || 0, userSettings?.currency)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency((item.quantity || 0) * (item.unitPrice || 0), userSettings?.currency)}</p>
                        {item.damagedQuantity ? (
                          <p className="text-sm text-destructive">Damaged: {item.damagedQuantity}</p>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedItem(index)}
                        className="flex items-center gap-1"
                      >
                        <AlertTriangle className="h-4 w-4" />
                        {t("receiptDetails.reportDamage")}
                      </Button>
                    </div>
                  </div>
                ))
              :
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-md">
                  <p className="text-muted-foreground text-center">{t("review.noItems")}</p>
                </div>
              }
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Tax</span>
                <span>{formatCurrency(receipt.tax || 0, userSettings?.currency)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t("review.total")}</span>
                <span>{formatCurrency(receipt.total || 0, userSettings?.currency)}</span>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-4 mt-auto border-t space-y-2">
          <div className="flex gap-2">
            {onEdit && (
              <Button onClick={() => onEdit(receipt)} className="flex-1">
                {t("receiptDetails.editReceipt")}
              </Button>
            )}
            <Button variant="outline" onClick={onClose} className="flex-1">
              {t("common.close")}
            </Button>
          </div>
        </div>
      </SheetContent>

      {selectedItem !== null && receipt.items[selectedItem] && (
        <DamagedItemForm
          receipt={receipt}
          item={receipt.items[selectedItem]}
          isOpen={selectedItem !== null}
          onClose={() => setSelectedItem(null)}
          onSuccess={() => {
            setSelectedItem(null);
            onReceiptUpdated(receipt);
          }}
        />
      )}
    </Sheet>
  );
};

export default MobileReceiptDetailsModal;
