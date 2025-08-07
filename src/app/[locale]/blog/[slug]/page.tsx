import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getAllBlogPosts, getBlogPostBySlug, getRelatedPosts } from '~/lib/blog';
import { extractTableOfContents } from '~/lib/markdown';
import { generateBlogMetadata, generateArticleSchema, generateBreadcrumbSchema } from '~/lib/seo';
import BlogContent from '~/components/blog/BlogContent';
import ReadingProgress from '~/components/blog/ReadingProgress';
import TableOfContents from '~/components/blog/TableOfContents';
import ShareButtons from '~/components/blog/ShareButtons';
import RelatedPosts from '~/components/blog/RelatedPosts';
import BlogPageWrapper from '~/components/blog/BlogPageWrapper';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { locales } from '~/config';

interface BlogPostPageProps {
  params: {
    locale: string;
    slug: string;
  };
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { locale, slug } = params;
  const post = await getBlogPostBySlug(slug, locale);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  return generateBlogMetadata(post);
}

export async function generateStaticParams() {
  const params = [];

  for (const locale of locales) {
    const posts = await getAllBlogPosts(locale);
    for (const post of posts) {
      if (!post.draft || process.env.NODE_ENV === 'development') {
        params.push({
          locale,
          slug: post.slug
        });
      }
    }
  }

  return params;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { locale, slug } = params;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const post = await getBlogPostBySlug(slug, locale);

  if (!post) {
    notFound();
  }

  // 在生产环境中隐藏草稿文章
  if (post.draft && process.env.NODE_ENV === 'production') {
    notFound();
  }

  const relatedPosts = await getRelatedPosts(post, 3);
  const tableOfContents = extractTableOfContents(post.content);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vibecoding.com';
  const postUrl = `${siteUrl}/${locale}/blog/${slug}`;

  // 生成结构化数据
  const articleSchema = generateArticleSchema(post);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: locale === 'zh' ? '首页' : 'Home', url: `/${locale}` },
    { name: locale === 'zh' ? '博客' : 'Blog', url: `/${locale}/blog` },
    { name: post.title }
  ]);

  return (
    <BlogPageWrapper>
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Header */}
      <Header locale={locale} page="blog" />

      {/* 阅读进度条 */}
      <ReadingProgress target="article" />

      {/* 目录 */}
      {tableOfContents.length > 0 && (
        <TableOfContents headings={tableOfContents} />
      )}

      <article className="min-h-screen bg-white">
        {/* 文章头部 */}
        <header className="relative">
          {/* 面包屑导航 */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <nav className="flex items-center space-x-2 text-sm text-gray-500">
                <Link href={`/${locale}`} className="hover:text-gray-700 transition-colors duration-200">
                  {locale === 'zh' ? '首页' : 'Home'}
                </Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link href={`/${locale}/blog`} className="hover:text-gray-700 transition-colors duration-200">
                  {locale === 'zh' ? '博客' : 'Blog'}
                </Link>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-gray-900 font-medium truncate">{post.title}</span>
              </nav>
            </div>
          </div>

          {/* 文章标题区域 */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-6">
                {/* 分类标签 */}
                <div className="flex justify-center">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {post.category}
                  </span>
                </div>

                {/* 标题 */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                  {post.title}
                </h1>

                {/* 描述 */}
                <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  {post.description}
                </p>

                {/* 文章元信息 */}
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{post.author}</div>
                      <div className="text-gray-500">Author</div>
                    </div>
                  </div>

                  <div className="h-8 w-px bg-gray-300"></div>

                  <div className="text-center">
                    <div className="font-medium text-gray-900">
                      {new Date(post.date).toLocaleDateString(locale === 'zh' ? 'zh-CN' : 'en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="text-gray-500">
                      {post.readingTime} min read
                    </div>
                  </div>
                </div>

                {/* 标签 */}
                <div className="flex flex-wrap justify-center gap-2">
                  {post.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/${locale}/blog?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 封面图片 */}
          {post.coverImage && (
            <div className="relative h-96 md:h-[500px] bg-gray-100">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          )}
        </header>

        {/* 文章内容 */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg prose-blue max-w-none">
            <BlogContent content={post.content} />
          </div>

          {/* 分享按钮 */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <ShareButtons
              url={postUrl}
              title={post.title}
              description={post.description}
            />
          </div>

          {/* 作者信息 */}
          <div className="mt-12 p-6 bg-gray-50 rounded-xl">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{post.author}</h3>
                <p className="text-gray-600 mt-1">
                  {locale === 'zh'
                    ? '专注于现代Web开发技术，分享编程经验和最佳实践。'
                    : 'Focused on modern web development technologies, sharing programming experience and best practices.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 相关文章 */}
        {relatedPosts.length > 0 && (
          <div className="bg-gray-50 py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <RelatedPosts posts={relatedPosts} currentPostId={post.slug} locale={locale} />
            </div>
          </div>
        )}
      </article>

      {/* Footer */}
      <Footer locale={locale} page="blog" />
    </BlogPageWrapper>
  );
}