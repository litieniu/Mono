import { SeoHead } from "@/components/seo-head";
import { useLanguage, LocalizedLink } from "@/lib/i18n";

/**
 * Affiliate 推广声明（AdSense + 欧美合规硬门槛）
 */
export function DisclosurePage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <div className="mx-auto w-full max-w-[720px] py-[32px] lg:py-[56px] px-[16px] lg:px-0">
      <SeoHead
        title={isEn ? "Affiliate Disclosure" : "推广声明"}
        description={isEn ? "How affiliate links on this blog work." : "本站推广链接的工作方式说明。"}
        url={isEn ? "/en/disclosure" : "/disclosure"}
      />
      <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{isEn ? "Affiliate Disclosure" : "推广声明"}</h1>
      <p className="text-[13px] text-muted-foreground/40 mt-[4px] mb-[24px]">
        {isEn ? "Last updated: 2026-10-18" : "最后更新：2026-10-18"}
      </p>
      <div className="prose-monolith space-y-[20px] text-[15px] leading-[1.8]">
        {isEn ? (
          <>
            <p>
              This blog is reader-supported. Some links on this site — particularly in cloud hosting reviews,
              tool recommendations, and tutorial articles — are <strong>affiliate links</strong>.
            </p>
            <h2>What does this mean?</h2>
            <p>
              If you click an affiliate link and make a purchase or sign up for a service,
              we may earn a commission <strong>at no additional cost to you</strong>.
              In many cases, our affiliate links actually give you a discount or bonus credit
              compared to signing up directly.
            </p>
            <h2>Our editorial independence</h2>
            <ul>
              <li>We only recommend products and services we have personally tested or thoroughly researched.</li>
              <li>Affiliate relationships never influence our rankings, scores, or review conclusions.</li>
              <li>When a product has significant drawbacks, we say so — even if it pays commission.</li>
            </ul>
            <h2>How to identify affiliate links</h2>
            <p>
              Affiliate links are marked with <code>rel="sponsored"</code> in the HTML,
              and recommendation sections carry a "SPONSORED" label.
              Our <LocalizedLink href="/hosting" className="underline">hosting comparison page</LocalizedLink> lists
              all affiliate partners in one place.
            </p>
            <h2>Questions?</h2>
            <p>
              Contact us via the <LocalizedLink href="/contact" className="underline">Contact page</LocalizedLink> if
              you have any questions about our affiliate relationships.
            </p>
          </>
        ) : (
          <>
            <p>
              本站由读者支持。站内部分链接——特别是云服务器测评、工具推荐和教程文章中的——为 <strong>Affiliate 推广链接</strong>。
            </p>
            <h2>这意味着什么？</h2>
            <p>
              如果您点击推广链接并购买或注册服务，我们可能会获得一笔佣金，<strong>而您不需要支付任何额外费用</strong>。
              很多情况下，通过我们的推广链接注册反而能获得折扣或赠金，比直接注册更划算。
            </p>
            <h2>我们的编辑独立性</h2>
            <ul>
              <li>我们只推荐亲自测试过或深入研究过的产品和服务。</li>
              <li>推广合作关系绝不影响我们的排名、评分或测评结论。</li>
              <li>即使某产品有推广佣金，如果它有明显缺点，我们也会如实指出。</li>
            </ul>
            <h2>如何识别推广链接</h2>
            <p>
              推广链接在 HTML 中带有 <code>rel="sponsored"</code> 标记，
              推荐区域会标注 "SPONSORED" 字样。
              我们的 <LocalizedLink href="/hosting" className="underline">云主机对比页</LocalizedLink> 集中列出了所有推广合作方。
            </p>
            <h2>有疑问？</h2>
            <p>
              如对我们的推广合作有任何疑问，请通过 <LocalizedLink href="/contact" className="underline">联系页面</LocalizedLink> 与我们沟通。
            </p>
          </>
        )}
      </div>
    </div>
  );
}
