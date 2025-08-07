export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  date: string;
  author: string;
  tags: string[];
  category: string;
  featured: boolean;
  draft: boolean;
  readingTime: number;
  coverImage?: string;
  locale: string;
  lastModified?: string;
}

export interface BlogMetadata {
  title: string;
  description: string;
  date: string;
  author: string;
  tags: string[];
  category: string;
  featured?: boolean;
  draft?: boolean;
  readingTime?: number;
  coverImage?: string;
}

export interface TableOfContents {
  id: string;
  title: string;
  level: number;
  children?: TableOfContents[];
}

export interface Tag {
  name: string;
  count: number;
  slug: string;
}

export interface BlogListResponse {
  posts: BlogPost[];
  totalCount: number;
  hasMore: boolean;
  tags: Tag[];
  categories: string[];
}

export interface RelatedPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  readingTime: number;
  tags: string[];
}

export interface BlogPagination {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}