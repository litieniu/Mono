import { getBackendUrl } from "./_shared";

/**
 * Sitemap 索引（手写本地生成，不再透传后端）
 *
 * /sitemap.xml → sitemap index，指向：
 *   /sitemap-posts.xml  文章
 *   /sitemap-pages.xml  静态页面
 *   /sitemap-tags.xml   标签页
 */

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
};

function xmlResponse(body: string): Response {
  return new Response(body, { status: 200, headers: XML_HEADERS });
}

function methodNotAllowed(): Response {
  return new Response("Method Not Allowed", {
    status: 405,
    headers: { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" },
  });
}

export const onRequest: PagesFunction<{ API_BASE: string }> = async (context) => {
  const method = context.request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") return methodNotAllowed();

  const url = new URL(context.request.url);
  const origin = `${url.protocol}//${url.host}`;
  const today = new Date().toISOString().split("T")[0];

  const index = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${origin}/sitemap-posts.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/sitemap-pages.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${origin}/sitemap-tags.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  // HEAD 只返回头
  if (method === "HEAD") {
    return new Response(null, { status: 200, headers: XML_HEADERS });
  }
  return xmlResponse(index);
};
