import { getBackendUrl } from "./_shared";

// Cloudflare Pages Function — 爬虫预渲染中间件
// 拦截社交平台/搜索引擎爬虫，注入文章专属 OG 标签
// 普通用户请求不受影响，直接返回 SPA

const BOT_UA_REGEX =
  /bot|crawl|spider|facebookexternalhit|Facebot|Twitterbot|LinkedInBot|Slackbot|TelegramBot|WhatsApp|Discordbot|Embedly|Quora Link Preview|Showyoubot|outbrain|pinterest|vkShare|W3C_Validator|baiduspider|yandex|sogou|360Spider/i;

interface Env {
  API_BASE: string;
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const withHsts: PagesFunction<Env> = async (context) => {
  const response = await context.next();
  if (new URL(context.request.url).protocol !== "https:") return response;
  if (response.headers.has("Strict-Transport-Security")) return response;

  // Match the backend policy without overriding headers from downstream handlers.
  const secured = new Response(response.body, response);
  secured.headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
  return secured;
};

const prerender: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 处理文章页：/posts/:slug 和 /en/posts/:slug
  const postMatch = pathname.match(/^(?:\/en)?\/posts\/([^/]+)$/);
  if (!postMatch) {
    return context.next();
  }

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

  // 爬虫请求 → 从后端获取文章数据
  const slug = postMatch[1];
  const isEn = pathname.startsWith("/en/");
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

    // 转义 HTML 特殊字符
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const escJson = (s: string) => JSON.stringify(s).slice(1, -1);

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
      url: articleUrl,
      datePublished: post.createdAt,
      dateModified: post.updatedAt || post.createdAt,
      inLanguage: isEn ? "en-US" : "zh-CN",
      author: { "@type": "Person", name: post.author || "Monolith" },
      publisher: {
        "@type": "Organization",
        name: "Monolith",
        url: siteOrigin,
      },
      mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
    };

    // 注入：canonical + hreflang + article meta + JSON-LD（在 </head> 前插入）
    const extraHead = [
      `<link rel="canonical" href="${esc(articleUrl)}" />`,
      `<link rel="alternate" hreflang="zh-CN" href="${esc(zhUrl)}" />`,
      `<link rel="alternate" hreflang="en" href="${esc(enUrl)}" />`,
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

export const onRequest = [withHsts, prerender];
