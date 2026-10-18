/**
 * 结构化数据（JSON-LD / Schema.org）构建器
 * 手写，不依赖第三方库，输出符合 Google 富媒体测试规范
 */

export interface SiteInfo {
  name: string;
  url: string; // https://example.com（不带尾斜杠）
  description: string;
  logo?: string; // 完整 URL
  socialLinks?: string[]; // GitHub、Twitter 等
  language?: string; // 默认 zh-CN
}

export interface ArticleInfo {
  title: string;
  description: string;
  url: string; // 完整 URL
  image?: string;
  datePublished: string; // ISO 8601
  dateModified?: string;
  authorName: string;
  tags?: string[];
  category?: string;
  wordCount?: number;
}

export interface BreadcrumbItem {
  name: string;
  url: string; // 完整 URL
}

export interface ListItemInfo {
  name: string;
  url: string; // 完整 URL
  image?: string;
  datePublished?: string;
}

/** BlogPosting：文章页（完整版） */
export function buildBlogPosting(site: SiteInfo, article: ArticleInfo, breadcrumbs?: BreadcrumbItem[]) {
  const lang = site.language || "zh-CN";
  const graph: object[] = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${article.url}#article`,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": article.url,
      },
      headline: article.title,
      description: article.description,
      url: article.url,
      ...(article.image ? { image: [article.image] } : {}),
      datePublished: article.datePublished,
      ...(article.dateModified ? { dateModified: article.dateModified } : {}),
      inLanguage: lang,
      author: {
        "@type": "Person",
        "@id": `${site.url}#author`,
        name: article.authorName,
        url: site.url,
      },
      publisher: {
        "@type": "Organization",
        "@id": `${site.url}#organization`,
        name: site.name,
        url: site.url,
        ...(site.logo
          ? { logo: { "@type": "ImageObject", url: site.logo } }
          : {}),
      },
      ...(article.tags?.length ? { keywords: article.tags.join(", ") } : {}),
      ...(article.category ? { articleSection: article.category } : {}),
      ...(article.wordCount ? { wordCount: article.wordCount } : {}),
    },
  ];

  // 面包屑
  if (breadcrumbs?.length) {
    graph.push(buildBreadcrumbList(breadcrumbs));
  }

  return graph.length === 1 ? graph[0] : { "@context": "https://schema.org", "@graph": graph };
}

/** WebSite + Organization：首页 */
export function buildWebSite(site: SiteInfo) {
  const lang = site.language || "zh-CN";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${site.url}#website`,
        url: site.url,
        name: site.name,
        description: site.description,
        inLanguage: lang,
        publisher: { "@id": `${site.url}#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${site.url}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${site.url}#organization`,
        name: site.name,
        url: site.url,
        description: site.description,
        ...(site.logo
          ? { logo: { "@type": "ImageObject", url: site.logo } }
          : {}),
        ...(site.socialLinks?.length ? { sameAs: site.socialLinks } : {}),
      },
    ],
  };
}

/** BreadcrumbList */
export function buildBreadcrumbList(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/** ItemList：归档页 / 标签页 / 分类页的文章列表 */
export function buildItemList(
  site: SiteInfo,
  listName: string,
  listUrl: string,
  items: ListItemInfo[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${listUrl}#collection`,
    url: listUrl,
    name: listName,
    isPartOf: { "@id": `${site.url}#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: item.url,
        name: item.name,
        ...(item.image ? { image: item.image } : {}),
        ...(item.datePublished ? { datePublished: item.datePublished } : {}),
      })),
    },
  };
}

/** ProfilePage：关于页 */
export function buildProfilePage(site: SiteInfo, pageUrl: string, personName: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${pageUrl}#profile`,
    url: pageUrl,
    mainEntity: {
      "@type": "Person",
      "@id": `${site.url}#author`,
      name: personName,
      url: site.url,
    },
  };
}
