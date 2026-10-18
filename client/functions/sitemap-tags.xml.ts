import { getBackendUrl } from "./_shared";

/**
 * 标签页 Sitemap（手写本地生成）
 * /sitemap-tags.xml
 */

const XML_HEADERS = {
  "Content-Type": "application/xml; charset=utf-8",
  "Cache-Control": "public, max-age=3600",
};

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
  const today = new Date().toISOString().split("T")[0];

  let tags: { name: string }[] = [];
  if (backend) {
    try {
      const res = await fetch(`${backend}/api/tags`, {
        headers: { Accept: "application/json" },
      });
      if (res.ok) {
        const data = (await res.json()) as unknown;
        const arr = Array.isArray(data)
          ? data
          : (data as { tags?: { name: string }[] }).tags || [];
        tags = arr;
      }
    } catch {
      // 忽略
    }
  }

  const urls = tags
    .map(
      (t) => `  <url>
    <loc>${origin}/tags/${encodeURIComponent(t.name)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.5</priority>
  </url>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  if (method === "HEAD") {
    return new Response(null, { status: 200, headers: XML_HEADERS });
  }
  return new Response(xml, { status: 200, headers: XML_HEADERS });
};
