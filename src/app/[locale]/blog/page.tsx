import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllBlogPosts, getFeaturedPosts, getAllTags, getAllCategories } from '~/lib/blog';
import { generateBlogListMetadata, generateBlogListSchema, generateWebsiteSchema } from '~/lib/seo';
import BlogHero from '~/components/blog/BlogHero';
import BlogList from '~/components/blog/BlogList';
import TagCloud from '~/components/blog/TagCloud';
import Header from '~/components/Header';
import Footer from '~/components/Footer';
import { locales } from '~/config';

interface BlogPageProps {
  params: {
    locale: string;
  };
  searchParams: {
    page?: string;
    tag?: string;
    category?: string;
  };
}

export async function generateMetadata({ params, searchParams }: BlogPageProps): Promise<Metadata> {
  const { locale } = params;
  const { tag, category } = searchParams;
  
  return generateBlogListMetadata(locale, tag, category);
}

export async function generateStaticParams() {
  return locales.map((locale) => ({
    locale,
  }));
}

export default async function BlogPage({ params, searchParams }: BlogPageProps) {
  const { locale } = params;
  const { page = '1', tag, category } = searchParams;
  
  if (!locales.includes(locale as any)) {
    notFound();
  }

  try {
    // 获取所有文章
    let posts = await getAllBlogPosts(locale);
    
    // 根据标签或分类过滤
    if (tag) {
      posts = posts.filter(post => 
        post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
      );
    }
    
    if (category) {
      posts = posts.filter(post => 
        post.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    // 获取精选文章
    const featuredPosts = await getFeaturedPosts(locale, 1);
    const featuredPost = featuredPosts[0];
    
    // 获取最近文章（用于Hero组件）
    const recentPosts = posts.slice(0, 5);
    
    // 分页处理
    const pageNum = parseInt(page);
    const postsPerPage = 12;
    const startIndex = (pageNum - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const paginatedPosts = posts.slice(startIndex, endIndex);
    
    const pagination = {
      currentPage: pageNum,
      totalPages: Math.ceil(posts.length / postsPerPage),
      hasNext: endIndex < posts.length,
      hasPrev: pageNum > 1
    };
    
    // 获取标签和分类
    const tags = await getAllTags(locale);
    const categories = await getAllCategories(locale);

    // 生成结构化数据
    const blogListSchema = generateBlogListSchema(posts, locale);
    const websiteSchema = generateWebsiteSchema(locale);

    return (
      <>
        {/* 结构化数据 */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        
        {/* Header */}
        <Header locale={locale} page="blog" />
        
        <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        {!tag && !category && pageNum === 1 && (
          <BlogHero 
            featuredPost={featuredPost} 
            recentPosts={recentPosts}
          />
        )}
        
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Page Header */}
          <div className="text-center mb-12">
            {tag && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  Tagged with: {tag}
                </span>
              </div>
            )}
            
            {category && (
              <div className="mb-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                  Category: {category}
                </span>
              </div>
            )}
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {tag ? `Posts tagged "${tag}"` : 
               category ? `Posts in "${category}"` :
               locale === 'zh' ? '最新文章' : 'Latest Articles'}
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {locale === 'zh' 
                ? '探索最新的Web开发技术、编程教程和最佳实践'
                : 'Explore the latest web development technologies, programming tutorials, and best practices'}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <BlogList 
                posts={paginatedPosts}
                pagination={pagination}
                locale={locale}
              />
            </div>
            
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-8">
                {/* Tag Cloud */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {locale === 'zh' ? '热门标签' : 'Popular Tags'}
                  </h3>
                  <TagCloud tags={tags} />
                </div>
                
                {/* Categories */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {locale === 'zh' ? '分类' : 'Categories'}
                  </h3>
                  <div className="space-y-2">
                    {categories.map((cat) => (
                      <a
                        key={cat}
                        href={`/${locale}/blog?category=${encodeURIComponent(cat)}`}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        {cat}
                      </a>
                    ))}
                  </div>
                </div>
                
                {/* Newsletter Signup */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {locale === 'zh' ? '订阅更新' : 'Stay Updated'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {locale === 'zh' 
                      ? '获取最新的技术文章和教程'
                      : 'Get the latest articles and tutorials'}
                  </p>
                  <div className="space-y-3">
                    <input
                      type="email"
                      placeholder={locale === 'zh' ? '输入邮箱地址' : 'Enter your email'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
                      {locale === 'zh' ? '订阅' : 'Subscribe'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <Footer locale={locale} page="blog" />
      </>
    );
  } catch (error) {
    console.error('Error loading blog page:', error);
    notFound();
  }
}