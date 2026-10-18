import { SeoHead } from "@/components/seo-head";
import { useLanguage, LocalizedLink } from "@/lib/i18n";

export function PrivacyPage() {
  const { lang } = useLanguage();
  const isEn = lang === "en";

  return (
    <div className="mx-auto w-full max-w-[720px] py-[32px] lg:py-[56px] px-[16px] lg:px-0">
      <SeoHead
        title={isEn ? "Privacy Policy" : "隐私政策"}
        description={isEn ? "How this blog handles your data, cookies and third-party advertising." : "本站如何处理您的数据、Cookie 与第三方广告。"}
        url={isEn ? "/en/privacy" : "/privacy"}
      />
      <h1 className="text-[28px] font-semibold tracking-[-0.02em]">{isEn ? "Privacy Policy" : "隐私政策"}</h1>
      <p className="text-[13px] text-muted-foreground/40 mt-[4px] mb-[24px]">
        {isEn ? "Last updated: 2026-10-18" : "最后更新：2026-10-18"}
      </p>
      <div className="prose-monolith space-y-[24px]">
        <section>
          <h2>{isEn ? "Data Collection" : "数据收集声明"}</h2>
          <p>{isEn ? "This blog may automatically collect the following non-personally identifiable information when you visit:" : "Monolith 博客在您访问时可能自动收集以下非个人身份信息："}</p>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left py-[8px] pr-[12px]">{isEn ? "Data Type" : "数据类型"}</th>
                <th className="text-left py-[8px] pr-[12px]">{isEn ? "Source" : "来源"}</th>
                <th className="text-left py-[8px]">{isEn ? "Purpose" : "用途"}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/10">
                <td className="py-[8px] pr-[12px]">{isEn ? "Visited page path" : "访问页面路径"}</td>
                <td className="py-[8px] pr-[12px]">{isEn ? "Request URL" : "请求 URL"}</td>
                <td className="py-[8px]">{isEn ? "Content stats" : "内容统计"}</td>
              </tr>
              <tr className="border-b border-border/10">
                <td className="py-[8px] pr-[12px]">{isEn ? "Visitor country" : "访客来源国家"}</td>
                <td className="py-[8px] pr-[12px]">{isEn ? "Cloudflare headers" : "Cloudflare 头"}</td>
                <td className="py-[8px]">{isEn ? "Traffic analysis" : "流量分析"}</td>
              </tr>
              <tr className="border-b border-border/10">
                <td className="py-[8px] pr-[12px]">{isEn ? "Referrer domain" : "来源域名"}</td>
                <td className="py-[8px] pr-[12px]">Referer</td>
                <td className="py-[8px]">{isEn ? "Traffic analysis" : "流量分析"}</td>
              </tr>
              <tr className="border-b border-border/10">
                <td className="py-[8px] pr-[12px]">{isEn ? "Device type" : "设备类型"}</td>
                <td className="py-[8px] pr-[12px]">User-Agent</td>
                <td className="py-[8px]">{isEn ? "Responsive optimization" : "响应式优化"}</td>
              </tr>
              <tr>
                <td className="py-[8px] pr-[12px]">{isEn ? "Commenter nickname" : "评论者昵称"}</td>
                <td className="py-[8px] pr-[12px]">{isEn ? "User input" : "用户主动填写"}</td>
                <td className="py-[8px]">{isEn ? "Public display" : "公开展示"}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>{isEn ? "Google AdSense & Third-Party Advertising" : "Google AdSense 与第三方广告"}</h2>
          <p>
            {isEn
              ? "This site displays ads served by Google AdSense. Google uses cookies (including the DoubleClick cookie) to serve ads based on your prior visits to this and other websites. You may opt out of personalized advertising by visiting Google Ads Settings."
              : "本站展示由 Google AdSense 提供的广告。Google 会使用 Cookie（包括 DoubleClick Cookie），根据您此前访问本站及其他网站的情况展示广告。您可以访问 Google 广告设置选择退出个性化广告。"}
          </p>
          <p>
            <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener" className="text-foreground/70 underline hover:text-foreground transition-colors">
              {isEn ? "Google Ads Settings" : "Google 广告设置"}
            </a>
            {" · "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener" className="text-foreground/70 underline hover:text-foreground transition-colors">
              {isEn ? "Google Privacy Policy" : "Google 隐私政策"}
            </a>
          </p>
        </section>

        <section>
          <h2>{isEn ? "Affiliate Links" : "推广链接"}</h2>
          <p>
            {isEn
              ? "Some links on this site are affiliate links. Clicking them may set a referral cookie from the merchant. See our Affiliate Disclosure for details."
              : "本站部分链接为 Affiliate 推广链接，点击后商家可能会设置推荐 Cookie。详见推广声明。"}
            {" "}
            <LocalizedLink href="/disclosure" className="text-foreground/70 underline hover:text-foreground transition-colors">
              {isEn ? "Affiliate Disclosure" : "推广声明"}
            </LocalizedLink>
          </p>
        </section>

        <section>
          <h2>{isEn ? "Cookie Usage" : "Cookie 使用"}</h2>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border/20">
                <th className="text-left py-[8px] pr-[12px]">Cookie</th>
                <th className="text-left py-[8px] pr-[12px]">{isEn ? "Purpose" : "用途"}</th>
                <th className="text-left py-[8px]">{isEn ? "Duration" : "持续时间"}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/10">
                <td className="py-[8px] pr-[12px]">monolith_lang</td>
                <td className="py-[8px] pr-[12px]">{isEn ? "Language preference" : "语言偏好"}</td>
                <td className="py-[8px]">1 {isEn ? "year" : "年"}</td>
              </tr>
              <tr className="border-b border-border/10">
                <td className="py-[8px] pr-[12px]">_gdpr_consent</td>
                <td className="py-[8px] pr-[12px]">{isEn ? "Privacy consent record" : "记录隐私同意"}</td>
                <td className="py-[8px]">1 {isEn ? "year" : "年"}</td>
              </tr>
              <tr>
                <td className="py-[8px] pr-[12px]">DoubleClick / AdSense</td>
                <td className="py-[8px] pr-[12px]">{isEn ? "Ad personalization (Google)" : "广告个性化（Google）"}</td>
                <td className="py-[8px]">{isEn ? "Per Google policy" : "按 Google 政策"}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section>
          <h2>{isEn ? "Data Deletion" : "数据删除请求"}</h2>
          <p>
            {isEn
              ? "To delete your comments or related data, please contact us via the Contact page. We will process your request within 14 business days."
              : "如您希望删除您的评论或相关数据，请通过联系页面与我们沟通，我们将在 14 个工作日内处理。"}
            {" "}
            <LocalizedLink href="/contact" className="text-foreground/70 underline hover:text-foreground transition-colors">
              {isEn ? "Contact" : "联系页面"}
            </LocalizedLink>
          </p>
        </section>
      </div>
    </div>
  );
}