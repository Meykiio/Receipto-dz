import React, { ReactNode, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  User, Home, Upload, MessageSquare, LogOut as LogOutIcon, Settings,
  AlertTriangle, BarChart2, Package, Menu, X, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";

interface NavItem {
  name: string;
  icon: ReactNode;
  path: string;
}

interface AppLayoutProps {
  children: ReactNode;
}
export function AppLayout({ children }: AppLayoutProps) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem("rt-nav-collapsed") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  const toggleCollapsed = () => {
    const next = !collapsed;
    setCollapsed(next);
    try {
      localStorage.setItem("rt-nav-collapsed", next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };
  const navGroups: Array<{ label?: string; items: NavItem[] }> = [
    {
      items: [
        { name: t("nav.dashboard"), icon: <Home className="h-4 w-4" />, path: "/dashboard" },
        { name: t("nav.capture"), icon: <Upload className="h-4 w-4" />, path: "/capture" },
      ],
    },
    {
      label: t("nav.groupMain"),
      items: [
        { name: t("nav.inventory"), icon: <Package className="h-4 w-4" />, path: "/inventory" },
        { name: t("nav.insights"), icon: <BarChart2 className="h-4 w-4" />, path: "/insights" },
        { name: t("nav.assistant"), icon: <MessageSquare className="h-4 w-4" />, path: "/assistant" },
        { name: t("nav.damagedItems"), icon: <AlertTriangle className="h-4 w-4" />, path: "/damaged" },
      ],
    },
    {
      label: t("nav.groupAccount"),
      items: [{ name: t("nav.settings"), icon: <Settings className="h-4 w-4" />, path: "/settings" }],
    },
  ];

  const isActive = (path: string) =>
    location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  const renderNav = (items: NavItem[], mobile = false) =>
    items.map((item) => {
      const active = isActive(item.path);
      const isCollapsed = collapsed && !mobile;
      return (
        <button
          key={item.path}
          type="button"
          onClick={() => go(item.path)}
          aria-current={active ? "page" : undefined}
          className={cn(
            "group/nav relative flex items-center gap-3 rounded-md py-2 text-[13.5px] font-semibold leading-tight",
            "text-muted-foreground transition-colors duration-fast ease-out hover:text-foreground",
            "hover:translate-x-[3px] focus-visible:outline-2 focus-visible:outline-primary",
            active && "text-primary hover:text-primary",
            isCollapsed ? "w-full justify-center px-0" : "px-3",
            mobile && "w-full"
          )}
        >
          <span className={cn("shrink-0 transition-opacity duration-fast", isCollapsed ? "opacity-80" : "opacity-70", active && "opacity-100")}>
            {isCollapsed
              ? React.cloneElement(item.icon as React.ReactElement, { className: "h-[18px] w-[18px]" })
              : item.icon}
          </span>
          {(!isCollapsed) && <span className="truncate">{item.name}</span>}
          {active && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-[18px] w-[3px] -translate-y-1/2 rounded-r-full bg-primary"
            />
          )}
        </button>
      );
    });

  const SidebarBody = ({ forceExpanded = false }: { forceExpanded?: boolean }) => {
    const isCollapsed = collapsed && !forceExpanded;
    return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2.5 px-5 pt-5 pb-3.5">
        <img src="/logo.svg" alt="Receipto Logo" className="h-8 w-8 shrink-0" />
        {!isCollapsed && <span className="whitespace-nowrap font-display text-xl font-extrabold tracking-tight">Receipto</span>}
      </div>

      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-5 pt-1 overscroll-contain" aria-label={t("nav.groupMain")}>
        {navGroups.map((group, gi) => (
          <div key={gi} className={cn("pt-4 first:pt-1", group.label && "mt-2 border-t border-border first:border-t-0")}>
            {group.label && !isCollapsed && (
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-outline-hi">
                {group.label}
              </div>
            )}
            {renderNav(group.items, forceExpanded)}
          </div>
        ))}
      </nav>

      {isCollapsed ? (
        /* Collapsed rail: three stacked circle actions */
        <div className="flex flex-col items-center gap-2 border-t border-border px-2 pb-4 pt-4">
          <ThemeToggle />
          <button
            type="button"
            onClick={toggleCollapsed}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-fast hover:border-primary hover:text-primary"
            aria-label={t("nav.expand")}
            title={t("nav.expand")}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-fast hover:border-destructive hover:text-destructive"
            aria-label={t("nav.signOut")}
            title={t("nav.signOut")}
          >
            <LogOutIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Expanded footer: user row + actions row */
        <div className="border-t border-border">
          <div className="flex items-center gap-2.5 px-4 pt-4">
            <User className="h-4 w-4 shrink-0 text-muted-foreground" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm text-foreground">{user?.email}</div>
              <div className="text-xs text-muted-foreground">{t("nav.signedIn")}</div>
            </div>
            <ThemeToggle className="shrink-0" />
          </div>
          <div className="flex items-center gap-2 px-4 pb-4 pt-3">
            {!forceExpanded && (
              <button
                type="button"
                onClick={toggleCollapsed}
                className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border px-3 py-2 text-[13px] font-semibold text-muted-foreground transition-colors duration-fast hover:border-primary hover:text-primary"
                aria-label={t("nav.collapse")}
                title={t("nav.collapse")}
              >
                <Menu className="h-4 w-4" />
                <span>{t("nav.collapse")}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => signOut()}
              className={cn(
                "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors duration-fast hover:border-destructive hover:text-destructive",
                forceExpanded && "flex-1"
              )}
              aria-label={t("nav.signOut")}
              title={t("nav.signOut")}
            >
              <LogOutIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
    );
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        role="complementary"
        aria-label="Navigation sidebar"
        className={cn(
          "hidden lg:flex h-full flex-col border-r border-border bg-sidebar text-sidebar-foreground",
          collapsed ? "w-[78px]" : "w-[280px]"
        )}
      >
        <SidebarBody />
      </aside>

      {/* Mobile topbar */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={t("a11y.openNavigation")}
            aria-expanded={mobileOpen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-toggle text-primary transition-transform duration-fast ease-spring active:scale-90"
          >
            <Menu className="h-5 w-5" />
          </button>
          <img src="/logo.svg" alt="Receipto Logo" className="h-7 w-7" />
          <span className="font-display text-lg font-extrabold tracking-tight">Receipto</span>
          <ThemeToggle className="ml-auto" />
        </header>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/60 opacity-100 transition-opacity duration-med ease-out"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <aside
              role="complementary"
              aria-label="Navigation sidebar"
              className="absolute inset-y-0 start-0 w-[min(320px,86vw)] bg-sidebar text-sidebar-foreground shadow-lg"
            >
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label={t("a11y.closeNavigation")}
                className="absolute end-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
              <SidebarBody forceExpanded />
            </aside>
          </div>
        )}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
