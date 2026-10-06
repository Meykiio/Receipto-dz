import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

export type Confidence = 'high' | 'medium' | 'low' | 'manual';

/**
 * Confidence chip per the design system semantic colors:
 * mint for read/high, saffron for medium, red for uncertain, sky for manual.
 */
const ConfidenceChip = ({ level }: { level: Confidence }) => {
  const { t } = useTranslation();
  const styles: Record<Confidence, string> = {
    high: 'bg-positive/10 text-positive border-positive/30',
    medium: 'bg-secondary/10 text-secondary border-secondary/30',
    low: 'bg-destructive/10 text-destructive border-destructive/30',
    manual: 'bg-brand-blue/10 text-brand-blue border-brand-blue/30',
  };
  const labels: Record<Confidence, string> = {
    high: t('review.high'),
    medium: t('review.medium'),
    low: t('review.low'),
    manual: t('review.manual'),
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[4px] border px-1.5 py-0.5 text-[10px] font-semibold',
        styles[level] ?? styles.manual
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current" aria-hidden="true" />
      {labels[level] ?? labels.manual}
    </span>
  );
};

export default ConfidenceChip;