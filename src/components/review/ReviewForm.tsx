import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Check, Plus, AlertTriangle, PencilLine, Save } from 'lucide-react';
import ConfidenceChip, { type Confidence } from './ConfidenceChip';
import { ItemEditor } from './ItemEditor';

interface ItemRow {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
  productId: string | null;
  tracked: boolean;
}

interface ReviewFormProps {
  vendorName: string;
  receiptDate: string;
  total: string;
  tax: string;
  currency: string;
  paymentMethod: string;
  items: ItemRow[];
  confidence: Record<string, Confidence>;
  draftError: string | null;
  hasParsed: boolean;
  saving: boolean;
  confirming: boolean;
  onVendorChange: (v: string) => void;
  onDateChange: (v: string) => void;
  onTotalChange: (v: string) => void;
  onTaxChange: (v: string) => void;
  onCurrencyChange: (v: string) => void;
  onPaymentChange: (v: string) => void;
  onAddItem: () => void;
  onUpdateItem: (key: string, patch: Partial<ItemRow>) => void;
  onRemoveItem: (key: string) => void;
  onSaveDraft: () => void;
  onConfirm: () => void;
}

const fieldClass = (level: Confidence) =>
  level === 'low' || level === 'medium' ? 'border-secondary/60 ring-2 ring-secondary/20' : '';

/**
 * Editable review form (right panel) per the design system: minimal parsed
 * fields, low-confidence fields highlighted, one primary confirm action.
 */
export const ReviewForm = ({
  vendorName, receiptDate, total, tax, currency, paymentMethod,
  items, confidence, draftError, hasParsed, saving, confirming,
  onVendorChange, onDateChange, onTotalChange, onTaxChange,
  onCurrencyChange, onPaymentChange, onAddItem, onUpdateItem, onRemoveItem,
  onSaveDraft, onConfirm,
}: ReviewFormProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="vendor">{t('review.vendor')}</Label>
              <ConfidenceChip level={confidence.vendorName} />
            </div>
            <Input id="vendor" value={vendorName} onChange={(e) => onVendorChange(e.target.value)} placeholder={t('review.vendor')} className={fieldClass(confidence.vendorName)} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="date">{t('review.date')}</Label>
              <ConfidenceChip level={confidence.receiptDate} />
            </div>
            <Input id="date" type="date" value={receiptDate} onChange={(e) => onDateChange(e.target.value)} className={fieldClass(confidence.receiptDate)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="total">{t('review.total')}</Label>
                <ConfidenceChip level={confidence.total} />
              </div>
              <Input id="total" type="number" min="0" step="0.01" value={total} onChange={(e) => onTotalChange(e.target.value)} placeholder="0.00" className={`${fieldClass(confidence.total)} money`} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">{t('review.tax')}</Label>
              <Input id="tax" type="number" min="0" step="0.01" value={tax} onChange={(e) => onTaxChange(e.target.value)} placeholder="0.00" className="money" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">{t('review.currency')}</Label>
              <Input id="currency" value={currency} onChange={(e) => onCurrencyChange(e.target.value)} maxLength={3} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">{t('review.payment')}</Label>
              <Input id="payment" value={paymentMethod} onChange={(e) => onPaymentChange(e.target.value)} placeholder="Cash, Card…" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{t('review.items')}</h3>
            <Button type="button" variant="outline" size="sm" onClick={onAddItem}>
              <Plus className="h-3.5 w-3.5 mr-1" /> {t('review.addItem')}
            </Button>
          </div>

          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{t('review.noItems')}</p>
          ) : (
            <div className="space-y-3">
              {items.map((row) => (
                <ItemEditor
                  key={row.key}
                  row={row}
                  defaultUnit={currency === 'DZD' ? 'pc' : undefined}
                  onUpdate={(patch) => onUpdateItem(row.key, patch)}
                  onRemove={() => onRemoveItem(row.key)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" className="flex-1" onClick={onSaveDraft} disabled={saving || confirming}>
          <Save className="h-4 w-4 mr-2" /> {t('review.saveDraft')}
        </Button>
        <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={onConfirm} disabled={confirming || saving}>
          {confirming ? (
            <>{t('common.loading')}</>
          ) : (
            <><Check className="h-4 w-4 mr-2" /> {t('review.confirmSave')}</>
          )}
        </Button>
      </div>

      {draftError && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 rounded-md p-3">
          <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{draftError} {t('review.draftErrorHint')}</span>
        </div>
      )}

      {!hasParsed && !draftError && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted rounded-md p-3">
          <PencilLine className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <span>{t('review.manualHint')}</span>
        </div>
      )}
    </div>
  );
};