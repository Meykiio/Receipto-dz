import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail } from "lucide-react";

export default function Auth() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState("signin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("auth.allFieldsRequired"));
      return;
    }

    try {
      setIsSubmitting(true);
      await signIn(email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t("auth.allFieldsRequired"));
      return;
    }

    if (password.length < 8) {
      toast.error(t("auth.passwordTooShort"), {
        description: t("auth.passwordTooShortDesc"),
      });
      return;
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      toast.error(t("auth.passwordTooWeak"), {
        description: t("auth.passwordTooWeakDesc"),
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await signUp(email, password);
      setShowConfirmationMessage(true);
      setEmail("");
      setPassword("");
    } catch (error) {
      console.error("Sign up error:", error);
      setShowConfirmationMessage(false);
      if (error instanceof Error && /already registered/i.test(error.message)) {
        setTab("signin");
        setPassword("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/40">
      <Card className="mx-auto w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Receipto</CardTitle>
          <CardDescription>{t("auth.subtitle")}</CardDescription>
        </CardHeader>
        <Tabs
          defaultValue="signin"
          value={tab}
          onValueChange={(value) => {
            setTab(value);
            setShowConfirmationMessage(false);
          }}
          className="w-full"
        >
          <div className="px-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{t("auth.signIn")}</TabsTrigger>
              <TabsTrigger value="signup">{t("auth.signUp")}</TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="pt-6">
            {showConfirmationMessage ? (
              <Alert className="mb-4">
                <Mail className="h-4 w-4" />
                <AlertDescription>{t("auth.confirmEmail")}</AlertDescription>
              </Alert>
            ) : (
              <>
                <TabsContent value="signin">
                  <form onSubmit={handleSignIn}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">{t("auth.email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">{t("auth.password")}</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                        {isSubmitting ? t("auth.signingIn") : t("auth.signIn")}
                      </Button>
                    </div>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email">{t("auth.email")}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("auth.emailPlaceholder")}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">{t("auth.password")}</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                        <p className="text-sm text-muted-foreground">
                          {t("auth.passwordHint")}
                        </p>
                      </div>
                      <Button className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                        {isSubmitting ? t("auth.creatingAccount") : t("auth.signUp")}
                      </Button>
                    </div>
                  </form>
                </TabsContent>
              </>
            )}
          </CardContent>
        </Tabs>
      </Card>
    </div>
  );
}