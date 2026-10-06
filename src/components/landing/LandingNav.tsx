import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useMobile } from "@/hooks/useMobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";

const LandingNav = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const mobile = useMobile();

  const getUserMetadata = (key: string): string | undefined => {
    try {
      if (user && user.user_metadata && typeof user.user_metadata === "object") {
        return user.user_metadata[key] as string;
      }
      return undefined;
    } catch (error) {
      console.error("Error getting user metadata:", error);
      return undefined;
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navClass = `fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
    isScrolled ? "bg-card/95 backdrop-blur dark:bg-card/95 border-b border-border" : "bg-transparent"
  }`;

  const links = (
    <>
      <a href="#features" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{t("landing.navFeatures")}</a>
      <a href="#how-it-works" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{t("landing.navHowItWorks")}</a>
      <a href="#vision" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{t("landing.navVision")}</a>
    </>
  );

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={getUserMetadata("avatar_url")} alt={getUserMetadata("full_name") || ""} />
            <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild><Link to="/dashboard">{t("landing.navDashboard")}</Link></DropdownMenuItem>
        <DropdownMenuItem asChild><Link to="/settings">{t("landing.navSettings")}</Link></DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut()}>{t("landing.navSignOut")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <nav className={navClass}>
      <div className="container max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center text-xl font-bold">
          <img src="/logo.svg" alt="Receipto Logo" className="h-8 w-8 me-2" />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Receipto</span>
        </Link>

        {mobile ? (
          user ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
              </SheetTrigger>
              <SheetContent className="sm:max-w-sm">
                <div className="grid gap-4 py-4">
                  {links}
                  <LanguageSelector />
                  {userMenu}
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <div className="flex items-center gap-3">
              <LanguageSelector />
              <Link to="/auth" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{t("landing.navLogin")}</Link>
            </div>
          )
        ) : (
          <div className="flex items-center gap-6">
            {links}
            <LanguageSelector />
            {user ? userMenu : (
              <Link to="/auth" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">{t("landing.navLogin")}</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default LandingNav;