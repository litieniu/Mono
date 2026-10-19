import { Route, Switch, useLocation, Router } from "wouter";
import { useEffect, Suspense, lazy } from "react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SearchOverlay } from "@/components/search";
import {
  LanguageProvider,
  useLocalizedLocationHook,
  detectLanguageFromPath,
} from "@/lib/i18n";
import { ProtectedRoute } from "@/components/protected-route";
import { AdminLayout } from "@/components/admin-layout";
import { CookieConsent, getCookieConsent } from "@/components/cookie-consent";
import { trackPageview, bindUnloadTracker } from "@/lib/analytics";
import { fetchPosts } from "@/lib/api";
import { useAdSenseRouteRefresh } from "@/components/adsense";
import { useSiteSettings } from "@/lib/site-settings";
// 核心公开页静态同步导入：消除首屏二次 JS 分包等待（后台 Admin* 与次要页面保留 lazy）
import { HomePage } from "@/pages/home";
import { PostPage } from "@/pages/post";
import { HostingPage } from "@/pages/hosting";
import {
  parseCustomSnippets,
  legacyToSnippets,
  snippetAppliesTo,
  injectSnippetList,
  removeCustomInjection,
} from "@/lib/custom-injection";

// 代码分割 (Code Splitting)：核心公开页已改为顶部静态导入，后台与次要页面保留 lazy
const DocsPage = lazy(() => import("@/pages/docs").then((m) => ({ default: m.DocsPage })));
const ArchivePage = lazy(() => import("@/pages/archive").then((m) => ({ default: m.ArchivePage })));
const AboutPage = lazy(() => import("@/pages/about").then((m) => ({ default: m.AboutPage })));
const FriendsPage = lazy(() => import("@/pages/friends").then((m) => ({ default: m.FriendsPage })));
const GuestbookPage = lazy(() => import("@/pages/guestbook").then((m) => ({ default: m.GuestbookPage })));
const AdminLogin = lazy(() => import("@/pages/admin/login").then((m) => ({ default: m.AdminLogin })));
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard").then((m) => ({ default: m.AdminDashboard })));
const AdminEditor = lazy(() => import("@/pages/admin/editor").then((m) => ({ default: m.AdminEditor })));
const AdminSettings = lazy(() => import("@/pages/admin/settings").then((m) => ({ default: m.AdminSettings })));
const AdminBackup = lazy(() => import("@/pages/admin/backup").then((m) => ({ default: m.AdminBackup })));
const AdminPages = lazy(() => import("@/pages/admin/pages").then((m) => ({ default: m.AdminPages })));
const AdminComments = lazy(() => import("@/pages/admin/comments").then((m) => ({ default: m.AdminComments })));
const AdminFriends = lazy(() => import("@/pages/admin/friends").then((m) => ({ default: m.AdminFriends })));
const AdminGuestbook = lazy(() => import("@/pages/admin/guestbook").then((m) => ({ default: m.AdminGuestbook })));
const AdminMedia = lazy(() => import("@/pages/admin/media").then((m) => ({ default: m.AdminMedia })));
const AdminAnalytics = lazy(() => import("@/pages/admin/analytics").then((m) => ({ default: m.AdminAnalytics })));
const AdminSeo = lazy(() => import("@/pages/admin/seo").then((m) => ({ default: m.AdminSeo })));
const PrivacyPage = lazy(() => import("@/pages/privacy").then((m) => ({ default: m.PrivacyPage })));
const DisclosurePage = lazy(() => import("@/pages/disclosure").then((m) => ({ default: m.DisclosurePage })));
const ContactPage = lazy(() => import("@/pages/contact").then((m) => ({ default: m.ContactPage })));
const DynamicPage = lazy(() => import("@/pages/dynamic-page").then((m) => ({ default: m.DynamicPage })));
const NotFoundPage = lazy(() => import("@/pages/not-found").then((m) => ({ default: m.NotFoundPage })));


function syncDocumentBrand(settings: { site_title?: string; site_description?: string; site_icon?: string }) {
  const siteTitle = settings.site_title?.trim();
  const description = settings.site_description?.trim();
  const icon = settings.site_icon?.trim();

  if (siteTitle && document.title.startsWith("Monolith")) {
    document.title = description ? `${siteTitle} — ${description}` : siteTitle;
  }

  if (icon) {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = icon;
  }
}

function matchesPathPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

// 首屏加载动画结束：淡出并移除 #boot-splash（幂等）
function dismissBootSplash() {
  const el = document.getElementById("boot-splash");
  if (!el || el.dataset.dismissed) return;
  el.dataset.dismissed = "1";
  el.classList.add("is-done");
  window.setTimeout(() => el.remove(), 400);
}

export function App() {
  const [location] = useLocation();
  const { settings, ready: siteSettingsReady } = useSiteSettings();

  // 首屏预热：非后台页面在挂载第一毫秒就发出 /api/posts，与 /api/settings/public 并行
  // 利用 api.ts 的 inflightRequests + publicCache 去重，页面组件内的后续调用不会重复发请求
  // 加载动画结束条件：首屏数据返回（或 8 秒兜底）后再移除 boot-splash，消除动画消失与内容呈现之间的断档
  useEffect(() => {
    if (location.startsWith("/admin")) {
      dismissBootSplash();
      return;
    }
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      // 再等一帧，确保 React 已把首屏内容提交到 DOM
      requestAnimationFrame(() => dismissBootSplash());
    };
    fetchPosts().then(finish, finish);
    const failsafe = window.setTimeout(finish, 8000);
    return () => window.clearTimeout(failsafe);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 访客埋点：路由变化触发 pageview，页面卸载触发 duration 上报
  useEffect(() => {
    bindUnloadTracker();
    trackPageview(location);
  }, [location]);

  // AdSense：路由切换时刷新广告位
  useAdSenseRouteRefresh();

  // 路由判断逻辑
  const isAdminRoot = matchesPathPrefix(location, "/admin");
  const isEditorPage = matchesPathPrefix(location, "/admin/editor");
  const isLoginPage = matchesPathPrefix(location, "/admin/login");
  const isAdminArea = isAdminRoot && !isEditorPage && !isLoginPage;
  const isPublicPage = !isAdminRoot;

  // 注入自定义片段：按位置与作用域过滤；开启同意且含外部资源的片段，等访客同意后再加载
  useEffect(() => {
    removeCustomInjection();
    if (isAdminRoot || !siteSettingsReady) return undefined;

    syncDocumentBrand(settings);

    const parsed = parseCustomSnippets(settings.custom_snippets);
    const active = (parsed ?? legacyToSnippets(settings.custom_header, settings.custom_footer))
      .filter((snippet) => snippet.enabled && snippetAppliesTo(snippet, location || "/"));

    const cleanupConsent = injectSnippetList(active, getCookieConsent());
    return () => {
      cleanupConsent();
      removeCustomInjection();
    };
  }, [isAdminRoot, location, settings, siteSettingsReady]);

  return (
    <LanguageProvider>
      <SearchOverlay />

      {/* ======== 1. 公开前台展示区（首屏不等待 siteSettingsReady，立即挂载） ======== */}
      {isPublicPage && (
        <>
          <Navbar />
          <main className="mx-auto w-full max-w-[1440px] px-[20px] lg:px-[40px] flex-1 flex flex-col">
            <Suspense fallback={<div className="p-8 flex justify-center text-zinc-500">Loading...</div>}>
              {/* i18n 路由：/en/* 剥离前缀后匹配，后台路由不受影响 */}
              <Router hook={useLocalizedLocationHook}>
              <Switch>
                <Route path="/" component={HomePage} />
                <Route path="/docs/:seriesSlug/:slug?" component={DocsPage} />
                <Route path="/posts/:slug" component={PostPage} />
                <Route path="/archive" component={ArchivePage} />
                <Route path="/about" component={AboutPage} />
                <Route path="/friends" component={FriendsPage} />
                <Route path="/guestbook" component={GuestbookPage} />
                <Route path="/privacy" component={PrivacyPage} />
                <Route path="/disclosure" component={DisclosurePage} />
                <Route path="/contact" component={ContactPage} />
                <Route path="/hosting" component={HostingPage} />
                <Route path="/page/:slug" component={DynamicPage} />
                <Route>
                  <NotFoundPage />
                </Route>
              </Switch>
              </Router>
            </Suspense>
          </main>
          <Footer />
          <CookieConsent />
        </>
      )}

      {/* ======== 2. 后台全屏编辑器区 ======== */}
      {isEditorPage && (
        <ProtectedRoute>
          <main className="mx-auto w-full px-[16px] flex-1 flex flex-col">
            <Suspense fallback={<div className="p-8 flex justify-center text-zinc-500">Loading...</div>}>
              <Switch>
                <Route path="/admin/editor/:slug?">
                  <AdminEditor />
                </Route>
              </Switch>
            </Suspense>
          </main>
        </ProtectedRoute>
      )}

      {/* ======== 3. 后台登录页 (无外壳独立渲染) ======== */}
      {isLoginPage && (
        <main className="mx-auto w-full max-w-[1440px] px-[20px] lg:px-[40px] flex-1 flex flex-col">
           <Suspense fallback={<div className="p-8 flex justify-center text-zinc-500">Loading...</div>}>
            <Switch>
              <Route path="/admin/login" component={AdminLogin} />
            </Switch>
          </Suspense>
        </main>
      )}

      {/* ======== 4. 核心管理后台区 (Admin App Shell) ======== */}
      {isAdminArea && (
        <ProtectedRoute>
          <AdminLayout>
            <Suspense fallback={<div className="p-8 flex justify-center text-zinc-500">Loading...</div>}>
              <Switch>
                <Route path="/admin/settings"><AdminSettings /></Route>
                <Route path="/admin/backup"><AdminBackup /></Route>
                <Route path="/admin/pages"><AdminPages /></Route>
                <Route path="/admin/comments"><AdminComments /></Route>
                <Route path="/admin/friends"><AdminFriends /></Route>
                <Route path="/admin/guestbook"><AdminGuestbook /></Route>
                <Route path="/admin/media"><AdminMedia /></Route>
                <Route path="/admin/analytics"><AdminAnalytics /></Route>
                <Route path="/admin/seo"><AdminSeo /></Route>
                <Route path="/admin"><AdminDashboard /></Route>
                <Route><NotFoundPage /></Route>
              </Switch>
            </Suspense>
          </AdminLayout>
        </ProtectedRoute>
      )}
    </LanguageProvider>
  );
}
