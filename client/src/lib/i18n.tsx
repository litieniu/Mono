import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { zh } from "./translations/zh";
import { en } from "./translations/en";

export type Language = "zh" | "en";
export type TranslationKey = keyof typeof zh;

const DICTS = { zh, en } as const;
const STORAGE_KEY = "monolith_lang";
const COOKIE_KEY = "monolith_lang";

/** 从 URL 判断语言：/en 开头即英文 */
export function detectLanguageFromPath(pathname: string): Language {
  return pathname === "/en" || pathname.startsWith("/en/") ? "en" : "zh";
}

/** 剥离语言前缀，返回路由匹配用的路径 */
export function stripLangPrefix(pathname: string): string {
  if (pathname === "/en") return "/";
  if (pathname.startsWith("/en/")) return pathname.slice(3);
  return pathname;
}

/** 给路径加上当前语言前缀 */
export function addLangPrefix(path: string, lang: Language): string {
  if (lang === "zh") return path;
  // 已经带前缀的不重复加
  if (path === "/en" || path.startsWith("/en/")) return path;
  return path === "/" ? "/en" : `/en${path}`;
}

/** 切换语言时，把当前路径映射到目标语言 */
export function switchLangPath(pathname: string, target: Language): string {
  const stripped = stripLangPrefix(pathname);
  return addLangPrefix(stripped, target);
}

interface LanguageContextValue {
  lang: Language;
  setLang: (l: Language) => void;
  /** 翻译函数：t("nav.home")，支持 {name} 插值 */
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  /** 生成带语言前缀的链接 */
  lp: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function writeStoredLang(lang: Language) {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch { /* ignore */ }
  try {
    document.cookie = `${COOKIE_KEY}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
  } catch { /* ignore */ }
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [wouterPath] = useWouterLocation();
  // 初始语言完全由 URL 路径决定：/en 开头即英文，否则一律中文。
  // 不嗅探 navigator.language、不读本地存储，避免英文浏览器访问中文根路径时 UI 语言闪烁跳变。
  const [lang, setLangState] = useState<Language>(() =>
    detectLanguageFromPath(window.location.pathname)
  );

  // URL 变化时同步语言（浏览器前进/后退）
  useEffect(() => {
    const fromUrl = detectLanguageFromPath(wouterPath);
    setLangState((prev) => (prev === fromUrl ? prev : fromUrl));
  }, [wouterPath]);

  // 语言变化时同步 <html lang> 和存储
  useEffect(() => {
    document.documentElement.setAttribute("lang", lang === "zh" ? "zh-CN" : "en");
    writeStoredLang(lang);
  }, [lang]);

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    // 跳转到对应语言的当前路径
    const target = switchLangPath(window.location.pathname + window.location.search, l);
    window.history.pushState(null, "", target);
    // 触发 wouter 更新：派发 popstate
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      const dict = DICTS[lang] as Record<string, string>;
      let s: string = dict[key] ?? (DICTS.zh as Record<string, string>)[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.split(`{${k}}`).join(String(v));
        }
      }
      return s;
    },
    [lang],
  );

  const lp = useCallback((path: string) => addLangPrefix(path, lang), [lang]);

  const value = useMemo(
    () => ({ lang, setLang, t, lp }),
    [lang, setLang, t, lp],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}

/**
 * 与 wouter useLocation() 同签名的安全版本：直接订阅浏览器地址变化，
 * 不经过 wouter 的 Router 上下文。
 *
 * 背景：<Router hook={useLocalizedLocationHook}> 内部若调用 wouter 的 useLocation()，
 * 它会经 useRouter() 读到当前 Router 的 hook（即 useLocalizedLocationHook 自身），
 * 形成无限递归（Maximum call stack size exceeded，首页白屏）。
 * 此实现返回 [原始路径（含 /en 前缀）, 跳转函数]，在自定义 Router 内外均可安全使用。
 */
const LOCATION_CHANGE_EVENTS = ["popstate", "pushState", "replaceState", "hashchange"] as const;

function subscribeToLocationChange(onChange: () => void): () => void {
  LOCATION_CHANGE_EVENTS.forEach((event) => window.addEventListener(event, onChange));
  return () => {
    LOCATION_CHANGE_EVENTS.forEach((event) => window.removeEventListener(event, onChange));
  };
}

function readBrowserPathname(): string {
  return window.location.pathname;
}

function navigateInPlace(to: string, options?: { replace?: boolean }): void {
  window.history[options?.replace ? "replaceState" : "pushState"](null, "", to);
  // wouter 已在模块加载时 monkey-patch 了 pushState/replaceState 并 dispatch 对应事件；
  // 这里再补发一个 popstate，保证订阅者一定收到通知。
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function useWouterLocation(): [
  string,
  (to: string, options?: { replace?: boolean }) => void,
] {
  const pathname = useSyncExternalStore(subscribeToLocationChange, readBrowserPathname);
  return [pathname, navigateInPlace];
}

/**
 * wouter 自定义 location hook：剥离 /en 前缀后再做路由匹配
 * 用法：<Router hook={useLocalizedLocationHook}><Switch>...</Switch></Router>
 */
export function useLocalizedLocationHook(): [
  string,
  (to: string, options?: { replace?: boolean }) => void,
] {
  const [rawPath, rawNavigate] = useWouterLocation();
  const { lang } = useLanguage();

  const path = useMemo(() => stripLangPrefix(rawPath), [rawPath]);

  const navigate = useCallback(
    (to: string, options?: { replace?: boolean }) => {
      // 内部跳转自动带上语言前缀
      const target = to.startsWith("http") ? to : addLangPrefix(to, lang);
      rawNavigate(target, options);
    },
    [rawNavigate, lang],
  );

  return [path, navigate];
}

/** 带语言前缀的 Link，直接替换 wouter 的 Link 使用 */
export function LocalizedLink({
  href,
  children,
  ...rest
}: {
  href: string;
  children: ReactNode;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const { lp } = useLanguage();
  const [, navigate] = useWouterLocation();

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // 修饰键/新窗口行为保留浏览器默认
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    navigate(lp(href));
    rest.onClick?.(e);
  };

  return (
    <a {...rest} href={lp(href)} onClick={handleClick}>
      {children}
    </a>
  );
}
