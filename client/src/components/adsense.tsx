import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { ADSENSE_CONFIG } from "@/lib/ads-config";
import { useLanguage } from "@/lib/i18n";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * AdSense 脚本单例加载
 */
let scriptPromise: Promise<void> | null = null;

function ensureAdSenseScript(client: string): Promise<void> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve, reject) => {
    // 已经存在则直接 resolve
    if (document.querySelector('script[src*="adsbygoogle.js"]')) {
      resolve();
      return;
    }
    const s = document.createElement("script");
    s.async = true;
    s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("AdSense script load failed"));
    document.head.appendChild(s);
  });
  return scriptPromise;
}

/**
 * 触发单个广告位渲染（带重试）
 */
function pushAd(retries = 5) {
  try {
    (window.adsbygoogle = window.adsbygoogle || []).push({});
  } catch {
    if (retries > 0) {
      setTimeout(() => pushAd(retries - 1), 400);
    }
  }
}

interface AdSlotProps {
  slot: string;
  /** 横幅尺寸：leaderboard=728x90, banner=468x60, large-rect=336x280, responsive=自适应 */
  size: "leaderboard" | "banner" | "large-rect" | "responsive";
  className?: string;
  label?: string;
}

const SIZE_STYLES: Record<AdSlotProps["size"], React.CSSProperties> = {
  leaderboard: { width: "728px", height: "90px", maxWidth: "100%" },
  banner: { width: "468px", height: "60px", maxWidth: "100%" },
  "large-rect": { width: "336px", height: "280px", maxWidth: "100%" },
  responsive: { display: "block", width: "100%" },
};

/**
 * 硬编码广告位（Ad Inserter 风格）
 * - 固定尺寸，不交给 AdSense 自动决定
 * - 每个实例独立 push，路由切换时重新挂载会自动重新请求
 */
export function AdSlot({ slot, size, className = "", label }: AdSlotProps) {
  const { t } = useLanguage();
  const displayLabel = label ?? t("ads.label");
  const insRef = useRef<HTMLElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CONFIG.enabled || !ADSENSE_CONFIG.client.startsWith("ca-pub-")) return;

    let cancelled = false;
    ensureAdSenseScript(ADSENSE_CONFIG.client)
      .then(() => {
        if (cancelled || pushedRef.current) return;
        // 小延迟确保 ins 元素已在 DOM 中
        setTimeout(() => {
          if (!cancelled && !pushedRef.current) {
            pushAd();
            pushedRef.current = true;
          }
        }, 100);
      })
      .catch(() => {
        // 脚本加载失败则静默跳过，不破坏页面
      });

    return () => {
      cancelled = true;
    };
  }, [slot]);

  if (!ADSENSE_CONFIG.enabled || !ADSENSE_CONFIG.client.startsWith("ca-pub-")) {
    return null;
  }

  return (
    <div className={`ad-slot my-[16px] md:my-[24px] ${className}`}>
      <div className="mb-[6px] text-center font-mono text-[10px] tracking-widest text-muted-foreground/40">
        {displayLabel}
      </div>
      <div className="flex justify-center overflow-hidden">
        <ins
          // @ts-expect-error adsbygoogle 自定义元素
          ref={insRef}
          className="adsbygoogle"
          style={SIZE_STYLES[size]}
          data-ad-client={ADSENSE_CONFIG.client}
          data-ad-slot={slot}
          {...(size === "responsive"
            ? { "data-ad-format": "auto", "data-full-width-responsive": "true" }
            : {})}
        />
      </div>
    </div>
  );
}

/**
 * 路由切换时刷新广告
 * 放在 App 顶层：每次 pathname 变化，通知所有 AdSlot 重新 push
 * （AdSlot 卸载重挂会自动处理，这里是兜底：处理同页锚点跳转等边缘情况）
 */
export function useAdSenseRouteRefresh() {
  const [pathname] = useLocation();

  useEffect(() => {
    if (!ADSENSE_CONFIG.enabled || !ADSENSE_CONFIG.client.startsWith("ca-pub-")) return;
    // 路由变化后，给新挂载的广告位一点时间再统一补推一次
    const t = setTimeout(() => {
      try {
        // 只处理仍在 DOM 中且未被填充的广告位（防旧页面卸载/新页面未挂载的竞态）
        const slots = Array.from(
          document.querySelectorAll("ins.adsbygoogle:not([data-ad-status])"),
        ).filter((el) => el.isConnected);
        if (slots.length > 0) {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch {
        // 忽略
      }
    }, 800);
    return () => clearTimeout(t);
  }, [pathname]);
}

// ============ 预设广告位（尺寸写死） ============

/** 文章页：标题下方 —— 728x90  leaderboard */
export function PostTopAd() {
  return <AdSlot slot={ADSENSE_CONFIG.slots.postTop} size="leaderboard" />;
}

/** 文章页：正文末尾 —— 336x280 大矩形 */
export function PostInlineAd() {
  return <AdSlot slot={ADSENSE_CONFIG.slots.postInline} size="large-rect" />;
}

/** 文章页：文末 —— 728x90 leaderboard */
export function PostBottomAd() {
  return <AdSlot slot={ADSENSE_CONFIG.slots.postBottom} size="leaderboard" />;
}

/** 首页信息流 —— 自适应 */
export function HomeFeedAd() {
  return <AdSlot slot={ADSENSE_CONFIG.slots.homeFeed} size="responsive" label="推荐" />;
}
