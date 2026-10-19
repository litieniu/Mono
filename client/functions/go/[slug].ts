/**
 * Affiliate 站内跳转：/go/:slug → 302 到推广链接
 * 用途：绕过 AdBlock 对 aff=/ref= 链接的拦截，主机商换域名时只改一处
 */

const GO_LINKS: Record<string, string> = {
  cloudflare: "https://www.cloudflare.com/",
  vultr: "https://www.vultr.com/",
  // 在此添加更多：slug → 目标 URL
  // bwh: "https://bandwagonhost.com/aff.php?aff=xxx",
  // dmit: "https://www.dmit.io/aff.php?aff=xxx",
  // racknerd: "https://www.racknerd.com/aff.php?aff=xxx",
};

export const onRequest: PagesFunction = async (context) => {
  const slug = context.params.slug as string;
  const target = GO_LINKS[slug];

  if (!target) {
    return new Response("Not Found", { status: 404 });
  }

  return Response.redirect(target, 302);
};
