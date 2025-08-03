import { useTranslations } from 'next-intl';

export function useBlogTranslations() {
  const t = useTranslations('BlogText');
  
  return {
    // 页面标题和描述
    title: t('title'),
    description: t('description'),
    
    // 文章相关
    featuredArticle: t('featuredArticle'),
    recentArticles: t('recentArticles'),
    latestArticles: t('latestArticles'),
    relatedArticles: t('relatedArticles'),
    viewAllArticles: t('viewAllArticles'),
    readMore: t('readMore'),
    readFullArticle: t('readFullArticle'),
    
    // 元信息
    readingTime: t('readingTime'),
    publishedOn: t('publishedOn'),
    author: t('author'),
    tags: t('tags'),
    category: t('category'),
    
    // 导航和分类
    popularTags: t('popularTags'),
    categories: t('categories'),
    tableOfContents: t('tableOfContents'),
    
    // 搜索和过滤
    searchPlaceholder: t('searchPlaceholder'),
    noArticlesFound: t('noArticlesFound'),
    noArticlesMessage: t('noArticlesMessage'),
    loadingArticles: t('loadingArticles'),
    
    // 分页
    previousPage: t('previousPage'),
    nextPage: t('nextPage'),
    pageOf: t('pageOf'),
    
    // 标签和分类页面
    postsTaggedWith: t('postsTaggedWith'),
    postsInCategory: t('postsInCategory'),
    browseAllTagged: t('browseAllTagged'),
    browseAllCategory: t('browseAllCategory'),
    
    // 导航
    home: t('home'),
    blog: t('blog'),
    
    // 分享
    shareArticle: t('shareArticle'),
    copyLink: t('copyLink'),
    linkCopied: t('linkCopied'),
    shareOn: t('shareOn'),
    
    // 订阅
    stayUpdated: t('stayUpdated'),
    getLatestArticles: t('getLatestArticles'),
    enterEmail: t('enterEmail'),
    subscribe: t('subscribe'),
    
    // 错误处理
    failedToLoadImage: t('failedToLoadImage'),
    somethingWentWrong: t('somethingWentWrong'),
    errorMessage: t('errorMessage'),
    reloadPage: t('reloadPage')
  };
}

// 格式化函数
export function formatBlogText(
  template: string, 
  params: Record<string, string | number>
): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return params[key]?.toString() || match;
  });
}