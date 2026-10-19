/**
 * 广告与推广配置
 *
 * AdSense 敏感配置走环境变量（Vite 前缀 VITE_），避免硬编码进 Git：
 *   VITE_ADSENSE_CLIENT=ca-pub-xxxxxxxxxxxxxxxx
 *   VITE_ADSENSE_SLOT_POST_TOP=1111111111
 *   VITE_ADSENSE_SLOT_POST_INLINE=2222222222
 *   VITE_ADSENSE_SLOT_POST_BOTTOM=3333333333
 *   VITE_ADSENSE_SLOT_HOME_FEED=4444444444
 *
 * 本地开发：在 client/.env.local 中填写（已 gitignore）
 * Cloudflare Pages：在项目设置 → 环境变量中配置
 */

// ============ Google AdSense ============
const viteEnv = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

export const ADSENSE_CONFIG = {
  /** AdSense 发布商 ID，不填则全站不渲染广告 */
  client: viteEnv.VITE_ADSENSE_CLIENT || "",
  /** 是否启用广告（总开关） */
  enabled: true,
  /** 各广告位 Slot ID */
  slots: {
    /** 文章页：标题下方横幅 */
    postTop: viteEnv.VITE_ADSENSE_SLOT_POST_TOP || "",
    /** 文章页：正文中间 */
    postInline: viteEnv.VITE_ADSENSE_SLOT_POST_INLINE || "",
    /** 文章页：文末（相关推荐上方） */
    postBottom: viteEnv.VITE_ADSENSE_SLOT_POST_BOTTOM || "",
    /** 首页：文章列表中间 */
    homeFeed: viteEnv.VITE_ADSENSE_SLOT_HOME_FEED || "",
  },
} as const;

// ============ Affiliate 推广 ============
export interface AffiliateItem {
  /** 按钮上显示的名称 */
  name: string;
  /** 一句话描述 */
  description: string;
  /** 推广链接（带你的返佣参数） */
  url: string;
  /** 按钮颜色（tailwind 类名），不填用默认 */
  accentClass?: string;
}

export const AFFILIATE_CONFIG = {
  /** 是否显示推广区 */
  enabled: true,
  /** 推广区标题 */
  title: "推荐工具",
  /** 推广区副标题 */
  subtitle: "博主亲测好用的服务，通过链接注册你我都有优惠",
  items: [
    {
      name: "Cloudflare",
      description: "本站就跑在 CF 边缘网络上，免费套餐够用",
      url: "/go/cloudflare",
      accentClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    {
      name: "Vultr",
      description: "按小时计费的 VPS，新用户有赠金",
      url: "/go/vultr",
      accentClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
  ] as AffiliateItem[],
} as const;
