import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFindMatchingProducts, useCreateProduct } from '@/hooks/queries';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Ban } from 'lucide-react';

interface ProductSelectorProps {
  receiptItemId: string;
  description: string;
  defaultUnit?: string;
  onLinked: () => void;
}

export function ProductSelector({
  receiptItemId,
  description,
  defaultUnit = 'pc',
  onLinked,
}: ProductSelectorProps) {
  const [value, setValue] = useState(description);
  const [tracked, setTracked] = useState(true);
  const matches = useFindMatchingProducts(value);
  const { t } = useTranslation();
  const createProduct = useCreateProduct();

  const handleCreate = async () => {
    const name = value.trim();
    if (!name) return;
    await createProduct.mutateAsync({ name, defaultUnit });
    onLinked();
  };

  if (!tracked) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Ban className="h-3.5 w-3.5" />
        <span>Not tracked in inventory</span>
        <Button variant="link" size="sm" className="h-auto p-0" onClick={() => setTracked(true)}>
          Track
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("a11y.linkToProduct")}
        list={`product-options-${receiptItemId}`}
        className="h-8"
      />
      <datalist id={`product-options-${receiptItemId}`}>
        {matches.data?.map((product) => (
          <option key={product.id} value={product.name}>
            {product.defaultUnit}
          </option>
        ))}
      </datalist>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleCreate}
          disabled={createProduct.isPending || !value.trim()}
        >
          <Plus className="h-3.5 w-3.5 me-1" />
          Create product
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setTracked(false)}
        >
          <Ban className="h-3.5 w-3.5 me-1" />
          Don't track
        </Button>
        {matches.data && matches.data.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {matches.data.length} existing product{matches.data.length === 1 ? '' : 's'} match
          </span>
        )}
      </div>
    </div>
  );
}
