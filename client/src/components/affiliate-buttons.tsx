import { ExternalLink } from "lucide-react";
import { AFFILIATE_CONFIG } from "@/lib/ads-config";
import { useLanguage } from "@/lib/i18n";

/**
 * Affiliate 推广按钮区
 * - 数据写死在 lib/ads-config.ts 的 AFFILIATE_CONFIG
 * - 放在文章末尾（相关推荐上方），样式跟随主题
 * - 所有链接新窗口打开 + noopener
 */
export function AffiliateButtons() {
  const { t } = useLanguage();
  if (!AFFILIATE_CONFIG.enabled || AFFILIATE_CONFIG.items.length === 0) {
    return null;
  }

  return (
    <section className="affiliate-section my-[32px] rounded-md border border-border/20 bg-background/28 p-[18px] sm:p-[24px]">
      <div className="mb-[4px] flex items-center gap-[8px]">
        <div className="h-[2px] w-[32px] rounded-full bg-foreground/36" />
        <span className="font-mono text-[11px] text-muted-foreground/44">SPONSORED</span>
      </div>
      <h3 className="mb-[4px] text-[18px] font-semibold tracking-[-0.02em]">
        {t("affiliate.title")}
      </h3>
      <p className="mb-[16px] text-[13px] text-muted-foreground">
        {t("affiliate.subtitle")}
      </p>
      <div className="grid gap-[12px] sm:grid-cols-2">
        {AFFILIATE_CONFIG.items.map((item) => (
          <a
            key={item.name}
            href={item.url}
            target="_blank"
            rel="noopener sponsored nofollow"
            className={`group flex items-center justify-between gap-[12px] rounded-md border px-[16px] py-[14px] transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md ${
              item.accentClass ?? "bg-accent/30 border-border/20"
            }`}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-[6px] text-[15px] font-medium">
                {item.name}
                <ExternalLink className="h-[13px] w-[13px] opacity-50 transition-opacity group-hover:opacity-100" />
              </div>
              <div className="mt-[4px] truncate text-[12px] text-muted-foreground">
                {item.description}
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="mt-[12px] text-[11px] text-muted-foreground/50">
        {t("affiliate.disclaimer")}
      </p>
    </section>
  );
}
