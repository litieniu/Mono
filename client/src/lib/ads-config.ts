/**
 * 广告与推广配置（写死在此文件中，改一处全站生效）
 *
 * 使用说明：
 * 1. 把 ADSENSE_CLIENT 换成你自己的 AdSense 发布商 ID（ca-pub-开头的）
 * 2. 把每个广告位的 SLOT_ID 换成 AdSense 后台生成的广告单元 ID
 * 3. AFFILIATES 数组里填你的推广链接，删掉示例
 */

// ============ Google AdSense ============
export const ADSENSE_CONFIG = {
  /** AdSense 发布商 ID，不填则全站不渲染广告 */
  client: "ca-pub-XXXXXXXXXXXXXXXX",
  /** 是否启用广告（总开关） */
  enabled: true,
  /** 各广告位 Slot ID */
  slots: {
    /** 文章页：标题下方横幅 */
    postTop: "1111111111",
    /** 文章页：正文中间 */
    postInline: "2222222222",
    /** 文章页：文末（相关推荐上方） */
    postBottom: "3333333333",
    /** 首页：文章列表中间 */
    homeFeed: "4444444444",
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
      url: "https://www.cloudflare.com/",
      accentClass: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    },
    {
      name: "Vultr",
      description: "按小时计费的 VPS，新用户有赠金",
      url: "https://www.vultr.com/",
      accentClass: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
  ] as AffiliateItem[],
} as const;
