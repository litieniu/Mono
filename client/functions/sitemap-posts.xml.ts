import { getBackendUrl } from "./_shared";

/**
 * 文章 Sitemap（手写本地生成）
 * 从后端 API 拉取文章列表，生成 /sitemap-posts.xml
 */

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

interface PostMeta {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
}

export const onRequest: PagesFunction<{ API_BASE: string }> = async (context) => {
  const method = context.request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const backend = getBackendUrl(context.env);
  const url = new URL(context.request.url);
  const origin = `${url.protocol}//${url.host}`;

  let posts: PostMeta[] = [];
  if (backend) {
    try {
      const res = await fetch(`${backend}/api/posts`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as unknown;
        const arr = Array.isArray(data)
          ? data
          : (data as { posts?: PostMeta[]; items?: PostMeta[] }).posts ||
            (data as { items?: PostMeta[] }).items ||
            [];
        posts = arr;
      }
    } catch {
      // 后端不可用时返回空 sitemap，不抛 500
    }
  }

  const urls = posts
    .map((p) => {
      const lastmod = (p.updatedAt || p.createdAt || "").split("T")[0];
      const zhUrl = `${origin}/posts/${p.slug}`;
      const enUrl = `${origin}/en/posts/${p.slug}`;
      return `  <url>
    <loc>${escapeXml(zhUrl)}</loc>
    <xhtml:link rel="alternate" hreflang="zh-CN" href="${escapeXml(zhUrl)}" />
    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enUrl)}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(zhUrl)}" />
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  if (method === "HEAD") {
    return new Response(null, { status: 200, headers: XML_HEADERS });
  }
  return new Response(xml, { status: 200, headers: XML_HEADERS });
};
