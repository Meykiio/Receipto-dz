import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useUserSettings } from "@/contexts/UserSettingsContext";
import { setAppLocale, type SupportedLocale } from "@/i18n";
import { useBudget, useSetBudget } from "@/hooks/queries";
import { AiSettingsPanel } from "@/components/AiSettingsPanel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import PageHeader from "@/components/PageHeader";

const currentMonth = () => new Date().toISOString().slice(0, 7) + "-01";

const Settings = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const { userSettings, updateSettings } = useUserSettings();
  const [isLoading, setIsLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [fullName, setFullName] = useState("");
  const [currency, setCurrency] = useState("DZD");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [locale, setLocale] = useState<"ar" | "fr" | "en">("ar");
  const [budgetAmount, setBudgetAmount] = useState("");

  const { data: budget } = useBudget(currentMonth());
  const setBudget = useSetBudget();

  useEffect(() => {
    if (userSettings) {
      setFullName(userSettings.fullName || "");
      setCurrency(userSettings.currency || "DZD");
      setDateFormat(userSettings.dateFormat || "DD/MM/YYYY");
      setLocale(userSettings.locale || "ar");
    }
  }, [userSettings]);

  useEffect(() => {
    if (budget) setBudgetAmount(String(budget.amount));
  }, [budget]);

  const handleSaveProfile = async () => {
    try {
      setIsLoading(true);
      await updateSettings({ fullName, currency, dateFormat, locale });
      toast.success(t("settings.updated"));
    } catch (error: unknown) {
      toast.error(`${t("settings.updateFailed")}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveBudget = async () => {
    const amount = parseFloat(budgetAmount);
    if (isNaN(amount) || amount < 0) {
      toast.error(t("settings.budgetInvalid"));
      return;
    }
    try {
      setIsLoading(true);
      await setBudget.mutateAsync({ month: currentMonth(), amount, currency });
      toast.success(t("settings.budgetUpdated"));
    } catch (error: unknown) {
      toast.error(`${t("settings.budgetFailed")}: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      await supabase.from("user_settings").delete().eq("user_id", user.id);
      await supabase.from("receipts").delete().eq("user_id", user.id);
      await signOut();
      toast.success(t("settings.accountDeleted"));
    } catch (error: unknown) {
      toast.error(
        t("settings.accountDeleteFailed", {
          message: error instanceof Error ? error.message : String(error),
        })
      );
    } finally {
      setIsLoading(false);
      setDeleteOpen(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 md:p-6">
        <PageHeader title={t("settings.title")} />

        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile">{t("settings.profile")}</TabsTrigger>
            <TabsTrigger value="preferences">{t("settings.preferences")}</TabsTrigger>
            <TabsTrigger value="budget">{t("settings.budget")}</TabsTrigger>
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="account">{t("settings.account")}</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader><CardTitle>{t("settings.profile")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{t("settings.fullName")}</Label>
                  <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder={t("settings.fullName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{t("settings.email")}</Label>
                  <Input id="email" value={user?.email || ""} disabled />
                  <p className="text-sm text-muted-foreground">{t("settings.emailHint")}</p>
                </div>
                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? t("settings.saving") : t("settings.saveChanges")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader><CardTitle>{t("settings.preferences")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency">{t("settings.currency")}</Label>
                  <Select value={currency} onValueChange={(value) => setCurrency(value)}>
                    <SelectTrigger id="currency">
                      <SelectValue placeholder={t("settings.currency")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DZD">Algerian Dinar (DZD / DA)</SelectItem>
                      <SelectItem value="USD">United States Dollar (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                      <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                      <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                      <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">{t("settings.dateFormat")}</Label>
                  <Select value={dateFormat} onValueChange={(value) => setDateFormat(value)}>
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder={t("settings.dateFormat")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locale">{t("settings.language")}</Label>
                  <Select
                    value={locale}
                    onValueChange={(value) => {
                      setLocale(value as "ar" | "fr" | "en");
                      // Apply straight away so the whole UI flips direction now,
                      // rather than only after the save button is pressed.
                      setAppLocale(value as SupportedLocale);
                    }}
                  >
                    <SelectTrigger id="locale">
                      <SelectValue placeholder={t("settings.language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية (Arabic)</SelectItem>
                      <SelectItem value="fr">Français (French)</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">{t("settings.languageHint")}</p>
                </div>

                <Button onClick={handleSaveProfile} disabled={isLoading}>
                  {isLoading ? t("settings.saving") : t("settings.saveChanges")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="budget">
            <Card>
              <CardHeader><CardTitle>{t("settings.monthlyBudget")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetAmount">
                    {t("settings.budgetFor")} {new Date().toLocaleDateString(locale === "ar" ? "ar-DZ" : locale === "fr" ? "fr-FR" : "en-US", { month: "long", year: "numeric" })}
                  </Label>
                  <div className="flex items-center">
                    <div className="me-2 text-muted-foreground">{currency}</div>
                    <Input id="budgetAmount" type="number" min="0" step="1" value={budgetAmount} onChange={(e) => setBudgetAmount(e.target.value)} placeholder={t("settings.setBudget")} />
                  </div>
                </div>
                <Button onClick={handleSaveBudget} disabled={isLoading}>
                  {isLoading ? t("settings.saving") : t("settings.setBudget")}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai">
            <AiSettingsPanel />
          </TabsContent>

          <TabsContent value="account">
            <Card>
              <CardHeader><CardTitle>{t("settings.account")}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{t("settings.accountHint")}</p>
                <div>
                  <Button variant="outline" onClick={() => signOut()} disabled={isLoading}>
                    {t("settings.signOut")}
                  </Button>
                </div>
                <div>
                  <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={isLoading}>
                    {t("settings.deleteAccount")}
                  </Button>
                  <p className="mt-2 text-xs text-muted-foreground">{t("settings.deleteAccountHint")}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("settings.deleteAccount")}</AlertDialogTitle>
            <AlertDialogDescription>{t("settings.deleteAccountHint")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAccount} disabled={isLoading} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {t("settings.deleteAccount")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Settings;