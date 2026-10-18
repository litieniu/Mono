/**
 * 静态页面 Sitemap（手写，纯静态）
 * /sitemap-pages.xml
 */

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=86400",
};

// 静态页面清单：路径 → 优先级/更新频率
const STATIC_PAGES: { path: string; priority: string; changefreq: string }[] = [
  { path: "/", priority: "1.0", changefreq: "daily" },
  { path: "/archive", priority: "0.7", changefreq: "weekly" },
  { path: "/about", priority: "0.5", changefreq: "monthly" },
  { path: "/friends", priority: "0.5", changefreq: "monthly" },
  { path: "/guestbook", priority: "0.4", changefreq: "weekly" },
];

export const onRequest: PagesFunction = async (context) => {
  const method = context.request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "GET, HEAD", "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const url = new URL(context.request.url);
  const origin = `${url.protocol}//${url.host}`;
  const today = new Date().toISOString().split("T")[0];

  const urls = STATIC_PAGES.map(
    (p) => `  <url>
    <loc>${origin}${p.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`,
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  if (method === "HEAD") {
    return new Response(null, { status: 200, headers: XML_HEADERS });
  }
  return new Response(xml, { status: 200, headers: XML_HEADERS });
};
