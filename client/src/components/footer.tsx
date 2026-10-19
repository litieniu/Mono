import { useEffect, useState } from "react";

import { AnimateIn } from "@/hooks/use-animate";
import { fetchNavPages, type NavPage } from "@/lib/api";
import { useSiteSettings } from "@/lib/site-settings";
import { useLanguage, LocalizedLink } from "@/lib/i18n";

export function Footer() {
  const { t, lang } = useLanguage();
  const currentYear = new Date().getFullYear();
  const [navPages, setNavPages] = useState<NavPage[]>([]);
  const { settings } = useSiteSettings();

  useEffect(() => {
    fetchNavPages().then(setNavPages);
  }, []);

  const displayText =
    settings.footer_text ||
    (lang === "zh"
      ? `© ${currentYear} Monolith. 使用 Hono + Vite 构建，部署于 Cloudflare 边缘。`
      : `© ${currentYear} Monolith. Built with Hono + Vite, deployed on Cloudflare edge.`);

  return (
    <footer className="app-footer mt-auto border-t border-border/40">
      <AnimateIn animation="animate-fade-in" className="mx-auto flex max-w-[1440px] flex-col items-center gap-[12px] px-[20px] py-[28px] lg:px-[40px]">
        {/* 合规链接永远渲染：即使后台没有配置 navPages，/privacy、/disclosure、/contact 也始终可见 */}
        <nav className="flex flex-wrap items-center justify-center gap-x-[16px] gap-y-[4px]">
          {navPages.map((p) => (
            <LocalizedLink
              key={p.slug}
              href={`/page/${p.slug}`}
              className="text-[13px] text-muted-foreground/60 transition-colors duration-200 hover:text-foreground"
            >
              {p.title}
            </LocalizedLink>
          ))}
          <LocalizedLink href="/privacy" className="text-[13px] text-muted-foreground/60 transition-colors duration-200 hover:text-foreground">
            {t("footer.privacy")}
          </LocalizedLink>
          <LocalizedLink href="/disclosure" className="text-[13px] text-muted-foreground/60 transition-colors duration-200 hover:text-foreground">
            {t("footer.disclosure")}
          </LocalizedLink>
          <LocalizedLink href="/contact" className="text-[13px] text-muted-foreground/60 transition-colors duration-200 hover:text-foreground">
            {t("footer.contact")}
          </LocalizedLink>
        </nav>
        <p className="text-[12px] text-muted-foreground/50">{displayText}</p>
      </AnimateIn>
    </footer>
  );
}
