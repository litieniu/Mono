import { getBackendUrl } from "./_shared";

// Cloudflare Pages Function — 爬虫预渲染中间件
// 拦截社交平台/搜索引擎爬虫，注入文章专属 OG 标签与结构化数据，
// 并对 /hosting、/privacy、/disclosure、/contact、/about 等静态页注入
// 对应中英标题/描述/OG/canonical/hreflang 与 <noscript> 静态文本摘要。
// 普通用户请求不受影响，直接返回 SPA。

const BOT_UA_REGEX =
  /bot|crawl|spider|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|WhatsApp|Discordbot|Embedly|Quora Link Preview|Showyoubot|outbrain|pinterest|vkShare|W3C_Validator|baiduspider|yandex|sogou|360Spider/i;

interface Env {
  API_BASE: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

type PrerenderContext = Parameters<PagesFunction<Env>>[0];

/** HTML 转义（文章与静态页共用） */
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const withHsts: PagesFunction<Env> = async (context) => {
  const response = await context.next();
  if (new URL(context.request.url).protocol !== "https:") return response;
  if (response.headers.has("Strict-Transport-Security")) return response;

  // Match the backend policy without overriding headers from downstream handlers.
  const secured = new Response(response.body, response);
  secured.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  return secured;
};

// ── 静态页预渲染文案（中英） ──────────────────────────────────────────────

interface StaticSeo {
  title: string;
  description: string;
  h1: string;
  summary: string;
}

const STATIC_PRERENDER: Record<string, { zh: StaticSeo; en: StaticSeo }> = {
  "/hosting": {
    zh: {
      title: "2026 云服务器推荐与对比 | Monolith",
      description:
        "博主亲测的云服务器与建站工具对比：Cloudflare 免费 CDN 与边缘网络、Vultr 按小时计费 VPS。真实测试，诚实打分。",
      h1: "2026 云服务器推荐与对比",
      summary:
        "本站运行在 Cloudflare 边缘网络之上：免费套餐覆盖 CDN、Pages 静态托管与 Workers 无服务器计算，对个人博客完全够用。Vultr 提供按小时计费的云服务器，全球多个机房可选，新用户有赠金，适合短期测试与建站练手。所有评分基于真实性能、价格透明度和客服质量，而非佣金高低。页面中的推广按钮为 Affiliate 返佣链接，完整说明见《推广披露》。",
    },
    en: {
      title: "Cloud Hosting Comparison 2026 | Monolith",
      description:
        "Hands-on comparison of cloud hosting and tools I actually use: Cloudflare's free CDN and edge network, Vultr's hourly-billed VPS. Real tests, honest scores.",
      h1: "Cloud Hosting Comparison 2026",
      summary:
        "This site runs on the Cloudflare edge network: the free tier covers CDN, Pages static hosting and Workers serverless compute — plenty for a personal blog. Vultr offers hourly-billed cloud servers in data centers worldwide, with credit for new users — great for short-term tests and hands-on practice. Scores reflect real performance, pricing transparency and support quality, not commission rates. The deal buttons on this page are affiliate links; see the Disclosure page for details.",
    },
  },
  "/privacy": {
    zh: {
      title: "隐私政策 | Monolith",
      description:
        "本站隐私政策：Cookie 的使用、Google AdSense 广告个性化、数据收集范围与您的选择。",
      h1: "隐私政策",
      summary:
        "本站使用 Cookie 维持登录状态并记住您的语言偏好。Google AdSense 会在页面中展示广告，并可能使用 Cookie 实现广告个性化与效果衡量；您可以在 Google 广告设置中关闭个性化广告。我们不会出售您的个人信息，完整条款见隐私政策全文。",
    },
    en: {
      title: "Privacy Policy | Monolith",
      description:
        "Privacy policy: how cookies are used, Google AdSense ad personalization, what data is collected and your choices.",
      h1: "Privacy Policy",
      summary:
        "This site uses cookies to keep you signed in and remember your language preference. Google AdSense serves ads on these pages and may use cookies for ad personalization and measurement; you can opt out of personalized ads in your Google Ads Settings. We never sell your personal information. See the full privacy policy for details.",
    },
  },
  "/disclosure": {
    zh: {
      title: "推广披露 | Monolith",
      description:
        "Affiliate 推广披露：本站部分链接为返佣链接，您的购买价格不受影响，评分不受佣金影响。",
      h1: "推广披露",
      summary:
        "本站部分链接（例如云服务器推荐页的推广按钮）为 Affiliate 返佣链接：您通过这些链接购买，博主可能获得一笔佣金，而您支付的价格保持不变。所有评分与推荐均基于真实亲测，不受佣金高低影响。Google AdSense 广告与 Affiliate 推广是本站维持运营的收入来源。",
    },
    en: {
      title: "Affiliate Disclosure | Monolith",
      description:
        "Affiliate disclosure: some links on this site are referral links. Your price is unaffected and ratings are never influenced by commissions.",
      h1: "Affiliate Disclosure",
      summary:
        "Some links on this site (for example the deal buttons on the hosting comparison page) are affiliate links: if you buy through them, the author may earn a commission while the price you pay stays the same. All scores and recommendations are based on real hands-on testing and are never influenced by commission rates. Google AdSense ads and affiliate promotions are how this site stays running.",
    },
  },
  "/contact": {
    zh: {
      title: "联系我 | Monolith",
      description: "联系博主：合作、投稿、反馈与建议，一般 48 小时内回复。",
      h1: "联系我",
      summary:
        "如有商务合作、投稿、纠错或功能建议，欢迎通过本页留言或邮件联系博主，一般会在 48 小时内回复。广告合作请先阅读《推广披露》。",
    },
    en: {
      title: "Contact | Monolith",
      description:
        "Contact the author: partnerships, contributions, feedback and suggestions — usually answered within 48 hours.",
      h1: "Contact",
      summary:
        "For business inquiries, contributions, corrections or feature suggestions, leave a message on this page or email the author — replies usually arrive within 48 hours. Please read the Affiliate Disclosure before proposing ad partnerships.",
    },
  },
  "/about": {
    zh: {
      title: "关于 | Monolith",
      description:
        "关于 Monolith：一个运行在 Cloudflare 边缘的个人博客，分享建站、VPS 与效率工具的真实测评。",
      h1: "关于",
      summary:
        "Monolith 是一个运行在 Cloudflare 边缘网络上的个人博客：前端由 Cloudflare Pages 托管，后端是 Hono + D1 的 Serverless API。这里分享建站、云服务器与效率工具的真实亲测，不接软文，评分只看实测表现。",
    },
    en: {
      title: "About | Monolith",
      description:
        "About Monolith: a personal blog running on the Cloudflare edge, sharing hands-on reviews of hosting, VPS and productivity tools.",
      h1: "About",
      summary:
        "Monolith is a personal blog running on the Cloudflare edge network: the frontend is hosted on Cloudflare Pages and the backend is a Hono + D1 serverless API. It shares real hands-on reviews of website building, cloud hosting and productivity tools — no sponsored posts, scores reflect tested performance only.",
    },
  },
};

/** 静态页预渲染：注入标题/描述/OG/canonical/hreflang + <noscript> 静态摘要 */
const prerenderStaticPage = async (
  context: PrerenderContext,
  page: string,
  isEn: boolean
): Promise<Response> => {
  const { request } = context;
  const url = new URL(request.url);
  const seo = STATIC_PRERENDER[page][isEn ? "en" : "zh"];
  const siteOrigin = url.origin;
  const zhUrl = `${siteOrigin}${page}`;
  const enUrl = `${siteOrigin}/en${page}`;
  const pageUrl = isEn ? enUrl : zhUrl;

  try {
    // 获取原始 index.html（用根路径请求静态资源）
    const indexUrl = new URL("/", request.url);
    const assetRes = await context.env.ASSETS.fetch(new Request(indexUrl.toString()));
    let html = await assetRes.text();

    // <title>：替换，不存在则插入
    if (/<title>[^<]*<\/title>/.test(html)) {
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(seo.title)}</title>`);
    } else {
      html = html.replace("</head>", `    <title>${esc(seo.title)}</title>\n  </head>`);
    }

    // meta 标签：存在则替换 content，不存在则插入
    const upsertMeta = (name: string, content: string, property = false) => {
      const re = new RegExp(`(<meta\\s+(?:name|property)="${name}"\\s+content=")[^"]*(")`);
      if (re.test(html)) {
        html = html.replace(re, `$1${esc(content)}$2`);
      } else {
        const attr = property ? "property" : "name";
        html = html.replace(
          "</head>",
          `    <meta ${attr}="${name}" content="${esc(content)}" />\n  </head>`
        );
      }
    };
    upsertMeta("description", seo.description);
    upsertMeta("og:title", seo.title, true);
    upsertMeta("og:description", seo.description, true);
    upsertMeta("og:type", "website", true);
    upsertMeta("og:url", pageUrl, true);
    upsertMeta("og:locale", isEn ? "en_US" : "zh_CN", true);
    upsertMeta("twitter:title", seo.title);
    upsertMeta("twitter:description", seo.description);

    // canonical + hreflang（模板 head 无这些标签，直接追加）
    const extraHead = [
      `<link rel="canonical" href="${esc(pageUrl)}" />`,
      `<link rel="alternate" hreflang="zh-CN" href="${esc(zhUrl)}" />`,
      `<link rel="alternate" hreflang="en" href="${esc(enUrl)}" />`,
      `<link rel="alternate" hreflang="x-default" href="${esc(zhUrl)}" />`,
    ].join("\n    ");
    html = html.replace("</head>", `    ${extraHead}\n  </head>`);

    // 注入 <noscript> 静态文本摘要（爬虫无 JS 时可见内容）
    html = html.replace(
      /<div id="root"><\/div>/,
      `<div id="root"></div><noscript><main><h1>${esc(seo.h1)}</h1><p>${esc(seo.summary)}</p></main></noscript>`
    );

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-Robots-Tag": "index, follow",
      },
    });
  } catch {
    // 静态资源读取失败，回退到 SPA
    return context.next();
  }
};

/** 文章页预渲染：注入文章专属 OG/JSON-LD/hreflang + <noscript> 纯文本正文 */
const prerenderArticle = async (
  context: PrerenderContext,
  slug: string,
  isEn: boolean
): Promise<Response> => {
  const { request } = context;
  const url = new URL(request.url);

  const backend = getBackendUrl(context.env);
  if (!backend) {
    return context.next();
  }

  try {
    const apiRes = await fetch(`${backend}/api/posts/${slug}`, {
      headers: { "User-Agent": "Monolith-Prerender/1.0" },
    });

    if (!apiRes.ok) {
      // 文章不存在，返回正常 SPA 处理 404
      return context.next();
    }

    const post = (await apiRes.json()) as {
      title: string;
      excerpt: string;
      content: string;
      slug: string;
      tags: string[];
      createdAt: string;
      updatedAt: string;
      author?: string;
    };

    // 获取原始 index.html（用根路径请求静态资源）
    const indexUrl = new URL("/", request.url);
    const assetRes = await context.env.ASSETS.fetch(new Request(indexUrl.toString()));
    let html = await assetRes.text();

    // 循环清理 HTML 标签（防止嵌套标签如 <scr<script>ipt> 绕过）
    const stripHtml = (s: string) => {
      let result = s;
      let prev = "";
      while (prev !== result) {
        prev = result;
        result = result.replace(/<[^>]*>?/g, "");
      }
      return result.replace(/\s+/g, " ").trim();
    };
    const plainText = post.content ? stripHtml(post.content) : "";
    const description = post.excerpt || plainText.slice(0, 160);
    const siteOrigin = url.origin;
    const zhUrl = `${siteOrigin}/posts/${post.slug}`;
    const enUrl = `${siteOrigin}/en/posts/${post.slug}`;
    const articleUrl = isEn ? enUrl : zhUrl;
    const ogImage = `${siteOrigin}/og-default.png`;

    // CJK 检测：如果标题主要是中文，不声明英文版本（防重复内容惩罚）
    // 注意：必须在 const jsonLd 之前声明，避免 TDZ 导致的 ReferenceError
    const isCjkHeavy = (s: string) => {
      if (!s) return false;
      const cjk = (s.match(/[\u4e00-\u9fff]/g) || []).length;
      return cjk / Math.max(s.length, 1) > 0.3;
    };
    const contentIsChinese = isCjkHeavy(post.title);

    // 中文文章的 canonical 指向中文 URL，/en/ 访问时也不声明 en hreflang
    const canonicalUrl = contentIsChinese ? zhUrl : articleUrl;

    // 替换 <title>
    html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(post.title)} | Monolith</title>`);

    // 替换 OG 标签
    html = html.replace(
      /(<meta\s+property="og:title"\s+content=")[^"]*(")/,
      `$1${esc(post.title)}$2`
    );
    html = html.replace(
      /(<meta\s+property="og:description"\s+content=")[^"]*(")/,
      `$1${esc(description)}$2`
    );
    html = html.replace(
      /(<meta\s+property="og:type"\s+content=")[^"]*(")/,
      `$1article$2`
    );
    html = html.replace(
      /(<meta\s+property="og:image"\s+content=")[^"]*(")/i,
      `$1${ogImage}$2`
    );
    html = html.replace(
      /(<meta\s+property="og:locale"\s+content=")[^"]*(")/i,
      `$1${isEn ? "en_US" : "zh_CN"}$2`
    );

    // 替换 Twitter Card 标签
    html = html.replace(
      /(<meta\s+name="twitter:title"\s+content=")[^"]*(")/,
      `$1${esc(post.title)}$2`
    );
    html = html.replace(
      /(<meta\s+name="twitter:description"\s+content=")[^"]*(")/,
      `$1${esc(description)}$2`
    );

    // 替换 meta description
    html = html.replace(
      /(<meta\s+name="description"\s+content=")[^"]*(")/,
      `$1${esc(description)}$2`
    );

    // 构建 JSON-LD 结构化数据
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: description,
      url: canonicalUrl,
      datePublished: post.createdAt,
      dateModified: post.updatedAt || post.createdAt,
      inLanguage: contentIsChinese ? "zh-CN" : isEn ? "en-US" : "zh-CN",
      author: { "@type": "Person", name: post.author || "Monolith" },
      publisher: {
        "@type": "Organization",
        name: "Monolith",
        url: siteOrigin,
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    };

    // 注入：canonical + hreflang + article meta + JSON-LD（在 </head> 前插入）
    const extraHead = [
      `<link rel="canonical" href="${esc(canonicalUrl)}" />`,
      `<link rel="alternate" hreflang="zh-CN" href="${esc(zhUrl)}" />`,
      ...(!contentIsChinese ? [`<link rel="alternate" hreflang="en" href="${esc(enUrl)}" />`] : []),
      `<link rel="alternate" hreflang="x-default" href="${esc(zhUrl)}" />`,
      `<meta property="og:url" content="${esc(articleUrl)}" />`,
      `<meta property="article:published_time" content="${esc(post.createdAt)}" />`,
      post.updatedAt ? `<meta property="article:modified_time" content="${esc(post.updatedAt)}" />` : "",
      ...(post.tags || []).map((tag) => `<meta property="article:tag" content="${esc(tag)}" />`),
      `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`,
    ]
      .filter(Boolean)
      .join("\n    ");

    html = html.replace("</head>", `    ${extraHead}\n  </head>`);

    // 注入 <noscript> 纯文本正文（爬虫无 JS 时可见内容，防"内容单薄"拒审）
    const noscriptContent = plainText.slice(0, 5000);
    if (noscriptContent) {
      html = html.replace(
        /<div id="root"><\/div>/,
        `<div id="root"></div><noscript><article><h1>${esc(post.title)}</h1><p>${esc(noscriptContent)}</p></article></noscript>`
      );
    }

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
        "X-Robots-Tag": "index, follow",
      },
    });
  } catch {
    // 后端请求失败，回退到 SPA
    return context.next();
  }
};

const prerender: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 检测 User-Agent 是否为爬虫（含 AdSense 审核爬虫）
  const ua = request.headers.get("user-agent") || "";
  const BOT_UA_REGEX_EXTENDED = new RegExp(
    BOT_UA_REGEX.source + "|Mediapartners-Google|AdsBot-Google|Google-InspectionTool",
    "i"
  );
  if (!BOT_UA_REGEX_EXTENDED.test(ua)) {
    // 普通用户 → 直接返回 SPA
    return context.next();
  }
  const isEn = pathname === "/en" || pathname.startsWith("/en/");

  // 文章页：/posts/:slug 和 /en/posts/:slug
  const postMatch = pathname.match(/^(?:\/en)?\/posts\/([^/]+)$/);
  if (postMatch) {
    return prerenderArticle(context, postMatch[1], isEn);
  }

  // 静态页预渲染：/hosting、/privacy、/disclosure、/contact、/about（及 /en/* 对应路径）
  const staticMatch = pathname.match(/^(?:\/en)?\/(hosting|privacy|disclosure|contact|about)$/);
  if (staticMatch) {
    return prerenderStaticPage(context, `/${staticMatch[1]}`, isEn);
  }

  return context.next();
};

export const onRequest = [withHsts, prerender];
