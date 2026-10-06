import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { useBudget } from '@/hooks/queries';
import { Camera, Wallet, TrendingUp, Check } from 'lucide-react';

export function OnboardingChecklist({ hasReceipts }: { hasReceipts: boolean }) {
  const { t } = useTranslation();
  const { userSettings } = useUserSettings();
  const { data: budget } = useBudget(new Date().toISOString().slice(0, 7) + '-01');

  const currencySet = !!userSettings?.currency && userSettings.currency !== '';
  const budgetSet = !!budget && budget.amount > 0;
  const doneCount = [hasReceipts, currencySet, budgetSet].filter(Boolean).length;

  if (doneCount === 3) return null;

  const steps = [
    {
      done: hasReceipts,
      icon: <Camera className="h-4 w-4" />,
      title: t('onboarding.addReceipt'),
      desc: t('onboarding.addReceiptDesc'),
      to: '/capture',
      action: t('onboarding.addReceiptAction'),
    },
    {
      done: currencySet,
      icon: <Wallet className="h-4 w-4" />,
      title: t('onboarding.setCurrency'),
      desc: t('onboarding.setCurrencyDesc'),
      to: '/settings',
      action: t('onboarding.setCurrencyAction'),
    },
    {
      done: budgetSet,
      icon: <TrendingUp className="h-4 w-4" />,
      title: t('onboarding.setBudget'),
      desc: t('onboarding.setBudgetDesc'),
      to: '/settings',
      action: t('onboarding.setBudgetAction'),
    },
  ];

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">{t('onboarding.title')}</h2>
        <span className="text-sm text-muted-foreground">{doneCount}/3</span>
      </div>
      <div className="space-y-2">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex items-center justify-between gap-3 border rounded-md p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className={`h-8 w-8 flex items-center justify-center rounded-full ${
                  step.done ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-muted text-muted-foreground'
                }`}
              >
                {step.done ? <Check className="h-4 w-4" /> : step.icon}
              </div>
              <div>
                <p className="font-medium text-sm">{step.title}</p>
                <p className="text-xs text-muted-foreground">{step.desc}</p>
              </div>
            </div>
            {!step.done && (
              <Link to={step.to} className="text-sm text-brand-blue hover:underline whitespace-nowrap">
                {step.action}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}