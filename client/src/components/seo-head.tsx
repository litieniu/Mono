import { useEffect } from "react";
import {
  buildBlogPosting,
  buildWebSite,
  buildBreadcrumbList,
  type BreadcrumbItem as SDBreadcrumbItem,
} from "@/lib/structured-data";
import { useLanguage } from "@/lib/i18n";

type BreadcrumbItem = {
  name: string;
  url: string;
};

type SeoProps = {
  title?: string;
  description?: string;
  url?: string;
  type?: "website" | "article";
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
  tags?: string[];
  siteName?: string;
  breadcrumbs?: BreadcrumbItem[];
  noindex?: boolean;
};

const DEFAULT_SITE_NAME = "Monolith";
const DEFAULT_DESCRIPTION = "书写代码、设计与边缘计算的个人博客。";

/**
 * SEO 头部组件
 * 动态注入 <title>、<meta>、Open Graph、Twitter Card、Canonical URL
 * 和 JSON-LD 结构化数据（文章页）
 *
 * 使用方式：
 *   <SeoHead title="文章标题" description="..." url="/posts/slug" type="article" />
 */
export function SeoHead({
  title,
  description,
  url,
  type = "website",
  image,
  publishedTime,
  modifiedTime,
  tags,
  siteName = DEFAULT_SITE_NAME,
  breadcrumbs,
  noindex = false,
}: SeoProps) {
  const { lang: pageLang } = useLanguage();
  const metaDescription = description || DEFAULT_DESCRIPTION;
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — ${metaDescription}`;
  // 多语言：og:locale 和 JSON-LD 的 inLanguage 跟随当前语言
  const ogLocale = pageLang === "en" ? "en_US" : "zh_CN";
  const canonicalUrl = url ? `${window.location.origin}${url}` : window.location.href;
  const ogImage = image || `${window.location.origin}/og-default.png`;

  useEffect(() => {
    // 设置标题
    document.title = fullTitle;

    // 辅助：设置或更新 meta 标签
    const setMeta = (attr: string, key: string, content: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    // 辅助：设置或更新 link 标签
    const setLink = (rel: string, href: string) => {
      let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // Meta Description
    setMeta("name", "description", metaDescription);

    // Robots（404 等页面需要 noindex）
    if (noindex) {
      setMeta("name", "robots", "noindex, nofollow");
    } else {
      // 移除可能残留的 noindex
      const robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta?.getAttribute("content")?.includes("noindex")) {
        robotsMeta.remove();
      }
    }

    // Canonical URL
    setLink("canonical", canonicalUrl);

    // hreflang：中英双语（SEO 多语言标注）
    // 防护：如果内容主要是中文，不输出 en hreflang（防"英文外壳+中文正文"被判重复内容）
    const isCjkHeavy = (s: string) => {
      if (!s) return false;
      const cjk = (s.match(/[\u4e00-\u9fff]/g) || []).length;
      return cjk / Math.max(s.length, 1) > 0.3;
    };
    const contentIsChinese = isCjkHeavy(title || "") || isCjkHeavy(metaDescription || "");

    // 清理旧的 hreflang
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => el.remove());
    if (url) {
      const origin = window.location.origin;
      // 当前语言版本
      const isEn = url.startsWith("/en");
      const zhUrl = isEn ? url.replace(/^\/en/, "") || "/" : url;
      const enUrl = isEn ? url : url === "/" ? "/en" : `/en${url}`;
      const mkHreflang = (lang: string, href: string) => {
        const el = document.createElement("link");
        el.setAttribute("rel", "alternate");
        el.setAttribute("hreflang", lang);
        el.setAttribute("href", `${origin}${href}`);
        document.head.appendChild(el);
      };
      mkHreflang("zh-CN", zhUrl);
      // 只有内容不是中文时才声明英文版本
      if (!contentIsChinese) {
        mkHreflang("en", enUrl);
      }
      mkHreflang("x-default", zhUrl);
    }

    // Open Graph
    setMeta("property", "og:title", title || siteName);
    setMeta("property", "og:description", metaDescription);
    setMeta("property", "og:type", type === "article" ? "article" : "website");
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:site_name", siteName);
    setMeta("property", "og:image", ogImage);
    setMeta("property", "og:locale", ogLocale);

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", title || siteName);
    setMeta("name", "twitter:description", metaDescription);
    setMeta("name", "twitter:image", ogImage);

    // Article 专属
    // 先清理旧的 article 相关 meta（防止页面切换残留）
    document.querySelectorAll('meta[property^="article:"]').forEach((el) => el.remove());

    if (type === "article" && publishedTime) {
      setMeta("property", "article:published_time", publishedTime);
    }
    if (type === "article" && modifiedTime) {
      setMeta("property", "article:modified_time", modifiedTime);
    }
    if (type === "article" && tags?.length) {
      // 每个标签需要独立的 <meta> 元素（不能复用同一个）
      tags.forEach((tag) => {
        const el = document.createElement("meta");
        el.setAttribute("property", "article:tag");
        el.setAttribute("content", tag);
        document.head.appendChild(el);
      });
    }

    // JSON-LD 结构化数据（手写构建器，见 lib/structured-data.ts）
    let ldScript = document.querySelector('script[data-seo="json-ld"]') as HTMLScriptElement | null;
    let jsonLd: object | null = null;
    const origin = window.location.origin;

    const siteInfo = {
      name: siteName,
      url: origin,
      description: metaDescription,
      logo: `${origin}/og-default.png`,
      language: pageLang === "en" ? "en-US" : "zh-CN",
    };

    const sdBreadcrumbs: SDBreadcrumbItem[] | undefined = breadcrumbs?.map((b) => ({
      name: b.name,
      url: `${origin}${b.url}`,
    }));

    if (type === "article" && title) {
      // 文章页：完整版 BlogPosting（含 wordCount、articleSection、mainEntityOfPage）
      // wordCount 从正文估算：调用方可在 props 中传入，这里用标题+描述兜底
      jsonLd = buildBlogPosting(
        siteInfo,
        {
          title,
          description: metaDescription,
          url: canonicalUrl,
          image: ogImage,
          datePublished: publishedTime || new Date().toISOString(),
          ...(modifiedTime ? { dateModified: modifiedTime } : {}),
          authorName: siteName,
          ...(tags?.length ? { tags } : {}),
        },
        sdBreadcrumbs,
      );
    } else if (url === "/") {
      // 首页：WebSite + Organization（含 logo、sameAs 预留）
      jsonLd = buildWebSite(siteInfo);
      // 首页面包屑单独追加
      if (sdBreadcrumbs?.length) {
        const crumb = buildBreadcrumbList(sdBreadcrumbs);
        jsonLd = {
          "@context": "https://schema.org",
          "@graph": [(jsonLd as { "@graph": object[] })["@graph"][0], (jsonLd as { "@graph": object[] })["@graph"][1], crumb],
        };
      }
    } else if (sdBreadcrumbs?.length) {
      // 其他页面：只有面包屑
      jsonLd = buildBreadcrumbList(sdBreadcrumbs);
    }

    if (jsonLd) {
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.setAttribute("type", "application/ld+json");
        ldScript.setAttribute("data-seo", "json-ld");
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(jsonLd);
    } else if (ldScript) {
      ldScript.remove();
    }

    // 组件卸载时清理动态注入的标签
    return () => {
      const script = document.querySelector('script[data-seo="json-ld"]');
      script?.remove();
      // 清理 article 相关 meta（防止页面切换残留）
      document.querySelectorAll('meta[property^="article:"]').forEach((el) => el.remove());
    };
  }, [fullTitle, metaDescription, canonicalUrl, ogImage, type, publishedTime, modifiedTime, title, siteName, tags, breadcrumbs, noindex, pageLang, ogLocale]);

  return null; // 纯副作用组件，不渲染 DOM
}
