"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminGate } from "@/components/admin-gate";
import { SearchTrigger } from "@/components/search";
import { LanguageSwitcher } from "@/components/language-switcher";
import { fetchNavPages, type NavPage } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings";
import { useLanguage, LocalizedLink, stripLangPrefix, useWouterLocation as useLocation } from "@/lib/i18n";

export function Navbar() {
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);
  const [navPages, setNavPages] = useState<NavPage[]>([]);
  const { settings } = useSiteSettings();
  const { t } = useLanguage();

  // 固定导航（翻译）
  const fixedStart = useMemo(() => [{ href: "/", label: t("nav.home") }], [t]);
  const fixedEnd = useMemo(
    () => [
      { href: "/hosting", label: t("nav.hosting") },
      { href: "/archive", label: t("nav.archive") },
      { href: "/friends", label: t("nav.friends") },
      { href: "/guestbook", label: t("nav.guestbook") },
      { href: "/about", label: t("nav.about") },
    ],
    [t],
  );

  useEffect(() => {
    fetchNavPages().then(setNavPages);
  }, []);

  const navLinks = useMemo(
    () => [
      ...fixedStart,
      ...navPages.map((p) => ({ href: `/page/${p.slug}`, label: p.title })),
      ...fixedEnd,
    ],
    [navPages, fixedStart, fixedEnd],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        setGateOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleLogoDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setGateOpen(true);
  }, []);

  const isAdmin = location.startsWith("/admin");
  // 剥离语言前缀后比较，用于导航高亮
  const strippedLocation = stripLangPrefix(location);

  return (
    <>
      <header className="app-header sticky top-0 z-50 w-full border-b border-border/30 bg-background/82 backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex h-[56px] max-w-[1440px] items-center justify-between px-[20px] lg:px-[40px]">
          <LocalizedLink
            href="/"
            className="group flex items-center gap-[10px] select-none animate-slide-in-left"
            onDoubleClick={handleLogoDoubleClick}
          >
            <div className="relative flex h-[32px] w-[32px] shrink-0 items-center justify-center">
              {settings.site_icon ? (
                <img
                  src={settings.site_icon}
                  alt=""
                  className="h-[28px] w-[28px] rounded-md object-cover transition-transform duration-300 group-hover:-translate-y-[2px]"
                />
              ) : (
                <div className="absolute inset-0 rounded-[3px] bg-gradient-to-b from-foreground/90 to-foreground/44 transition-all duration-300 group-hover:from-foreground group-hover:to-foreground/62" />
              )}
            </div>
            <span className="max-w-[180px] truncate text-[18px] font-semibold tracking-[-0.03em] text-foreground sm:max-w-[240px]">
              {settings.site_title}
            </span>
          </LocalizedLink>

          <nav className="hidden items-center gap-[8px] md:flex">
            {navLinks.map((link) => (
              <LocalizedLink
                key={link.href}
                href={link.href}
                className={`relative px-[12px] py-[6px] text-[14px] transition-colors duration-200 ${
                  strippedLocation === link.href
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {link.label}
                {strippedLocation === link.href && (
                  <span className="absolute bottom-0 left-[12px] right-[12px] h-[1.5px] bg-foreground rounded-full" />
                )}
              </LocalizedLink>
            ))}
          </nav>

          <div className="flex items-center gap-[4px]">
            <SearchTrigger />
            <LanguageSwitcher />

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                className="ml-[4px] inline-flex h-[44px] w-[44px] items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring md:hidden"
                aria-label="打开导航菜单"
              >
                <Menu className="h-[18px] w-[18px]" />
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] bg-background/95 backdrop-blur-xl">
                <nav className="flex flex-col gap-[4px] pt-[40px]">
                  {navLinks.map((link) => (
                    <LocalizedLink
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-md px-[16px] py-[12px] text-[15px] transition-colors duration-200 ${
                        strippedLocation === link.href
                          ? "bg-accent text-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }`}
                    >
                      {link.label}
                    </LocalizedLink>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {!isAdmin && (
        <AdminGate open={gateOpen} onClose={() => setGateOpen(false)} />
      )}
    </>
  );
}
