import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2 } from 'lucide-react';
import { ProductSelector } from '@/components/ProductSelector';

interface ItemRow {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
  productId: string | null;
  tracked: boolean;
}

interface ItemEditorProps {
  row: ItemRow;
  defaultUnit?: string;
  onUpdate: (patch: Partial<ItemRow>) => void;
  onRemove: () => void;
}

/**
 * One editable item row in the receipt review screen.
 */
export const ItemEditor = ({ row, defaultUnit, onUpdate, onRemove }: ItemEditorProps) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2 rounded-md border border-border p-3">
      <div className="flex items-start justify-between gap-2">
        <Input
          value={row.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder={t('review.itemDescription')}
          className="flex-1"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive"
          aria-label={t("a11y.removeItem")}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Input
          type="number" min="0" step="0.01" value={row.quantity}
          onChange={(e) => onUpdate({ quantity: e.target.value })}
          placeholder={t('review.qty')}
        />
        <Input
          type="number" min="0" step="0.01" value={row.unitPrice}
          onChange={(e) => onUpdate({ unitPrice: e.target.value })}
          placeholder={t('review.price')}
        />
        <Input
          type="number" min="0" step="0.01" value={row.total}
          onChange={(e) => onUpdate({ total: e.target.value })}
          placeholder={t('review.itemTotal')}
        />
      </div>
      <ProductSelector
        receiptItemId={row.key}
        description={row.description}
        defaultUnit={defaultUnit}
        onLinked={() => {}}
      />
    </div>
  );
};