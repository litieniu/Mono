import { SeoHead } from "@/components/seo-head";
import { useLanguage, LocalizedLink } from "@/lib/i18n";
import { ExternalLink, Star, BadgeCheck } from "lucide-react";
import { AFFILIATE_CONFIG } from "@/lib/ads-config";

/**
 * 云服务器/工具测评聚合页
 * 转化核心：对比表格 + Affiliate 按钮，SEO 目标词：云服务器推荐/cheap VPS/hosting comparison
 */
interface HostingRow {
  name: string;
  nameEn: string;
  price: string;
  priceEn: string;
  specs: string;
  specsEn: string;
  pros: string;
  prosEn: string;
  rating: number;
  badge?: string;
  badgeEn?: string;
  url: string;
}

const HOSTING_TABLE: HostingRow[] = [
  {
    name: "Cloudflare",
    nameEn: "Cloudflare",
    price: "免费起",
    priceEn: "Free tier",
    specs: "CDN / Pages / Workers / 边缘网络",
    specsEn: "CDN / Pages / Workers / Edge network",
    pros: "本站就跑在 CF 上，免费套餐足够个人博客",
    prosEn: "This blog runs on CF. Free tier is enough for personal blogs",
    rating: 5,
    badge: "本站同款",
    badgeEn: "Powers this blog",
    url: "https://www.cloudflare.com/",
  },
  {
    name: "Vultr",
    nameEn: "Vultr",
    price: "$2.5/月起",
    priceEn: "From $2.5/mo",
    specs: "按小时计费 / 全球机房 / 快照备份",
    specsEn: "Hourly billing / Global DCs / Snapshots",
    pros: "新用户有赠金，适合短期测试",
    prosEn: "New user credit, great for short-term tests",
    rating: 4,
    url: "https://www.vultr.com/",
  },
];

export function HostingPage() {
  const { lang, t } = useLanguage();
  const isEn = lang === "en";

  return (
    <>
      <SeoHead
        title={isEn ? "Cloud Hosting Comparison 2026" : "2026 云服务器推荐与对比"}
        description={isEn
          ? "Hands-on comparison of cloud hosting and tools I actually use. Real tests, honest scores."
          : "博主亲测的云服务器与建站工具对比，真实测试，诚实打分。"}
        url={isEn ? "/en/hosting" : "/hosting"}
        breadcrumbs={[
          { name: t("nav.home"), url: "/" },
          { name: isEn ? "Hosting" : "云服务", url: isEn ? "/en/hosting" : "/hosting" },
        ]}
      />

      <article className="mx-auto w-full max-w-[900px] py-[32px]">
        <div className="mb-[8px] flex items-center gap-[8px]">
          <div className="h-[2px] w-[48px] rounded-full bg-foreground/36" />
          <span className="font-mono text-[11px] text-muted-foreground/44">HOSTING GUIDE 2026</span>
        </div>
        <h1 className="mb-[12px] text-[32px] font-semibold tracking-tight sm:text-[40px]">
          {isEn ? "Cloud Hosting Comparison 2026" : "2026 云服务器推荐与对比"}
        </h1>
        <p className="mb-[24px] max-w-[680px] text-[15px] leading-[1.8] text-muted-foreground">
          {isEn
            ? "Every service below has been personally tested. Scores reflect real-world performance, pricing transparency, and support quality — not commission rates."
            : "以下每个服务都经过博主亲测。评分基于真实性能、价格透明度和客服质量——而不是佣金高低。"}
        </p>

        {/* 对比表格 */}
        <div className="overflow-x-auto rounded-md border border-border/20 mb-[32px]">
          <table className="w-full text-[14px] min-w-[640px]">
            <thead>
              <tr className="border-b border-border/20 bg-background/40">
                <th className="text-left px-[16px] py-[12px] font-medium">{isEn ? "Provider" : "服务商"}</th>
                <th className="text-left px-[16px] py-[12px] font-medium">{isEn ? "Price" : "价格"}</th>
                <th className="text-left px-[16px] py-[12px] font-medium">{isEn ? "Highlights" : "亮点"}</th>
                <th className="text-left px-[16px] py-[12px] font-medium">{isEn ? "Rating" : "评分"}</th>
                <th className="px-[16px] py-[12px]"></th>
              </tr>
            </thead>
            <tbody>
              {HOSTING_TABLE.map((row) => (
                <tr key={row.name} className="border-b border-border/10 last:border-0 hover:bg-background/30 transition-colors">
                  <td className="px-[16px] py-[14px]">
                    <div className="font-medium flex items-center gap-[8px]">
                      {isEn ? row.nameEn : row.name}
                      {(isEn ? row.badgeEn : row.badge) && (
                        <span className="inline-flex items-center gap-[4px] rounded-full bg-green-500/10 px-[8px] py-[2px] text-[11px] text-green-500 border border-green-500/20">
                          <BadgeCheck className="h-[11px] w-[11px]" />
                          {isEn ? row.badgeEn : row.badge}
                        </span>
                      )}
                    </div>
                    <div className="text-[12px] text-muted-foreground mt-[4px]">{isEn ? row.specsEn : row.specs}</div>
                  </td>
                  <td className="px-[16px] py-[14px] whitespace-nowrap">{isEn ? row.priceEn : row.price}</td>
                  <td className="px-[16px] py-[14px] text-muted-foreground text-[13px]">{isEn ? row.prosEn : row.pros}</td>
                  <td className="px-[16px] py-[14px]">
                    <div className="flex gap-[2px]">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-[14px] w-[14px] ${i < row.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <a
                      href={row.url}
                      target="_blank"
                      rel="noopener sponsored nofollow"
                      className="inline-flex items-center gap-[6px] whitespace-nowrap rounded-md bg-foreground px-[14px] py-[8px] text-[13px] font-medium text-background transition-transform hover:-translate-y-[1px]"
                    >
                      {isEn ? "Get Deal" : "领取优惠"}
                      <ExternalLink className="h-[13px] w-[13px]" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[12px] text-muted-foreground/60 mb-[32px]">
          {t("affiliate.disclaimer")}{" "}
          <LocalizedLink href="/disclosure" className="underline">
            {isEn ? "Learn more" : "了解更多"}
          </LocalizedLink>
        </p>

        {/* 相关测评文章占位 */}
        <h2 className="text-[20px] font-semibold mb-[16px]">{isEn ? "In-depth Reviews" : "深度测评"}</h2>
        <p className="text-[14px] text-muted-foreground">
          {isEn
            ? "Detailed hands-on reviews will appear here as they are published."
            : "详细测评文章发布后会出现在这里。"}
        </p>
      </article>
    </>
  );
}
