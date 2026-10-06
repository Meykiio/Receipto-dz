import { useEffect } from 'react';
import { useUserSettings } from '@/contexts/UserSettingsContext';
import { DEFAULT_LOCALE, getStoredLocale, isSupportedLocale, setAppLocale } from '@/i18n';

export function LocaleBridge() {
  const { userSettings, isLoading } = useUserSettings();
  const accountLocale = userSettings?.locale;

  useEffect(() => {
    if (isLoading) return;

    // For a signed-in user the account setting is the source of truth. Applying
    // it here (rather than only on mount) is what makes a change made in
    // Settings take effect immediately, instead of being overridden by the
    // language picked on the landing page.
    if (accountLocale && isSupportedLocale(accountLocale)) {
      setAppLocale(accountLocale);
      return;
    }

    // Logged out: honour whatever this browser last chose, else default.
    setAppLocale(getStoredLocale() ?? DEFAULT_LOCALE);
  }, [accountLocale, isLoading]);

  return null;
}