import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { draftStore, type ReviewDraft } from '@/lib/drafts';
import { confirmReceipt, type ReceiptDraft } from '@/services/receiptService';
import { useReceiptImageUrl } from '@/hooks/queries';
import { toast } from 'sonner';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import type { Confidence } from '@/components/review/ConfidenceChip';
import { ReviewForm } from '@/components/review/ReviewForm';

interface ItemRow {
  key: string;
  description: string;
  quantity: string;
  unitPrice: string;
  total: string;
  productId: string | null;
  tracked: boolean;
}

const toRow = (item: NonNullable<ReviewDraft['parsed']>['items'][number], index: number): ItemRow => ({
  key: `item-${index}`,
  description: item.description,
  quantity: String(item.quantity ?? ''),
  unitPrice: item.unitPrice != null ? String(item.unitPrice) : '',
  total: item.total != null ? String(item.total) : '',
  productId: null,
  tracked: true,
});

const confidenceFromDraft = (draft: ReviewDraft | null): Record<string, Confidence> => {
  if (!draft?.parsed) return { vendorName: 'manual', receiptDate: 'manual', total: 'manual' };
  const p = draft.parsed;
  return {
    vendorName: p.confidence.vendorName >= 0.8 ? 'high' : p.confidence.vendorName >= 0.5 ? 'medium' : 'low',
    receiptDate: p.confidence.receiptDate >= 0.8 ? 'high' : p.confidence.receiptDate >= 0.5 ? 'medium' : 'low',
    total: p.confidence.total >= 0.8 ? 'high' : p.confidence.total >= 0.5 ? 'medium' : 'low',
  };
};

export default function Review() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [draft] = useState<ReviewDraft | null>(draftStore.get());
  const [vendorName, setVendorName] = useState('');
  const [receiptDate, setReceiptDate] = useState('');
  const [total, setTotal] = useState('');
  const [tax, setTax] = useState('');
  const [currency, setCurrency] = useState('DZD');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [items, setItems] = useState<ItemRow[]>([]);
  const [confidence, setConfidence] = useState<Record<string, Confidence>>(() => confidenceFromDraft(draftStore.get()));
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const imageUrl = draft?.imageFile ? URL.createObjectURL(draft.imageFile) : null;
  const signedUrl = useReceiptImageUrl(draft?.imagePath ?? null);
  const displayUrl = imageUrl ?? signedUrl.data ?? null;

  useEffect(() => {
    if (draft?.parsed) {
      const p = draft.parsed;
      setVendorName(p.vendorName ?? '');
      setReceiptDate(p.receiptDate ?? '');
      setTotal(p.total != null ? String(p.total) : '');
      setTax(p.tax != null ? String(p.tax) : '');
      setCurrency(p.currency ?? 'DZD');
      setPaymentMethod(p.paymentMethod ?? '');
      setItems(p.items.map(toRow));
      setConfidence(confidenceFromDraft(draft));
    } else if (draft) {
      setConfidence({ vendorName: 'manual', receiptDate: 'manual', total: 'manual' });
    }
  }, [draft]);

  const overallConfidence = useMemo(() => {
    if (!draft?.parsed) return 0;
    return draft.parsed.confidence.overall;
  }, [draft]);

  if (!draft) {
    return (
      <AppLayout>
        <div className="p-6 max-w-2xl mx-auto text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto" />
          <h1 className="text-xl font-bold">{t('review.noReceiptToReview')}</h1>
          <p className="text-muted-foreground">{t('review.noReceiptHint')}</p>
          <Button onClick={() => navigate('/capture')}>{t('review.goToCapture')}</Button>
        </div>
      </AppLayout>
    );
  }

  const handleConfirm = async () => {
    const parsedTotal = parseFloat(total);
    if (isNaN(parsedTotal) || parsedTotal < 0) {
      toast.error(t('review.enterTotal'));
      return;
    }
    setConfirming(true);
    try {
      const receiptDraft: ReceiptDraft = {
        vendorName: vendorName.trim() || 'Unknown',
        receiptDate: receiptDate || null,
        total: parsedTotal,
        tax: tax ? parseFloat(tax) : null,
        currency,
        paymentMethod: paymentMethod || null,
        documentType: null,
        imagePath: draft.imagePath,
        ocrText: null,
        parseMethod: 'manual',
        items: items.map((row) => ({
          description: row.description,
          quantity: parseFloat(row.quantity) || 1,
          unitPrice: parseFloat(row.unitPrice) || 0,
          total: parseFloat(row.total) || 0,
          productId: row.productId,
          tracked: row.tracked,
        })),
      };
      await confirmReceipt(receiptDraft);
      draftStore.clear();
      toast.success(t('review.saved'));
      navigate('/dashboard');
    } catch (error) {
      console.error('Confirm error:', error);
      toast.error(error instanceof Error ? error.message : t('review.failedToSave'));
    } finally {
      setConfirming(false);
    }
  };

  const handleSaveDraft = () => {
    setSaving(true);
    try {
      const updated: ReviewDraft = {
        ...draft,
        parsed: {
          vendorName: vendorName.trim() || null,
          receiptDate: receiptDate || null,
          total: parseFloat(total) || null,
          tax: tax ? parseFloat(tax) : null,
          currency,
          paymentMethod: paymentMethod || null,
          items: items.map((row) => ({
            description: row.description,
            quantity: parseFloat(row.quantity) || 1,
            unitPrice: parseFloat(row.unitPrice) || 0,
            total: parseFloat(row.total) || 0,
            productId: row.productId,
            tracked: row.tracked,
          })),
          confidence: { vendorName: 0, receiptDate: 0, total: 0, overall: 0 },
        },
      };
      draftStore.set(updated);
      toast.success(t('review.draftSaved'));
      navigate('/dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <PageHeader
          title={t('review.title')}
          description={
            draft.parsed
              ? `${t('review.readingConfidence')}: ${Math.round(overallConfidence * 100)}%`
              : undefined
          }
        >
          <Button variant="ghost" size="sm" onClick={() => navigate('/capture')} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> {t('review.back')}
          </Button>
        </PageHeader>

        <div className="grid lg:grid-cols-2 gap-6">
          <div>
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                {displayUrl ? (
                  <img
                    src={displayUrl}
                    alt={t("a11y.receiptImage")}
                    className="w-full rounded-md border object-contain max-h-[70vh]"
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-muted rounded-md">
                    <p className="text-muted-foreground">{t('review.noImage')}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <ReviewForm
            vendorName={vendorName}
            receiptDate={receiptDate}
            total={total}
            tax={tax}
            currency={currency}
            paymentMethod={paymentMethod}
            items={items}
            confidence={confidence}
            draftError={draft.error ?? null}
            hasParsed={!!draft.parsed}
            saving={saving}
            confirming={confirming}
            onVendorChange={setVendorName}
            onDateChange={setReceiptDate}
            onTotalChange={setTotal}
            onTaxChange={setTax}
            onCurrencyChange={setCurrency}
            onPaymentChange={setPaymentMethod}
            onAddItem={() => setItems((prev) => [...prev, {
              key: `item-${Date.now()}`,
              description: '', quantity: '1', unitPrice: '', total: '',
              productId: null, tracked: true,
            }])}
            onUpdateItem={(key, patch) =>
              setItems((prev) => prev.map((row) => (row.key === key ? { ...row, ...patch } : row)))
            }
            onRemoveItem={(key) => setItems((prev) => prev.filter((r) => r.key !== key))}
            onSaveDraft={handleSaveDraft}
            onConfirm={handleConfirm}
          />
        </div>
      </div>
    </AppLayout>
  );
}