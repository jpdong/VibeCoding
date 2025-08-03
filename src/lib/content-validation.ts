import { BlogMetadata } from '~/types/blog';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// 验证博客文章元数据
export function validateBlogMetadata(metadata: Partial<BlogMetadata>, filePath: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 必需字段验证
  const requiredFields: (keyof BlogMetadata)[] = ['title', 'description', 'date', 'author'];
  
  for (const field of requiredFields) {
    if (!metadata[field]) {
      errors.push({
        field,
        message: `Missing required field: ${field}`,
        severity: 'error'
      });
    }
  }

  // 标题验证
  if (metadata.title) {
    if (metadata.title.length < 10) {
      warnings.push({
        field: 'title',
        message: 'Title is too short (recommended: at least 10 characters)',
        severity: 'warning'
      });
    }
    
    if (metadata.title.length > 100) {
      warnings.push({
        field: 'title',
        message: 'Title is too long (recommended: less than 100 characters)',
        severity: 'warning'
      });
    }
  }

  // 描述验证
  if (metadata.description) {
    if (metadata.description.length < 50) {
      warnings.push({
        field: 'description',
        message: 'Description is too short (recommended: at least 50 characters)',
        severity: 'warning'
      });
    }
    
    if (metadata.description.length > 200) {
      warnings.push({
        field: 'description',
        message: 'Description is too long (recommended: less than 200 characters)',
        severity: 'warning'
      });
    }
  }

  // 日期验证
  if (metadata.date) {
    const date = new Date(metadata.date);
    if (isNaN(date.getTime())) {
      errors.push({
        field: 'date',
        message: 'Invalid date format. Use YYYY-MM-DD format',
        severity: 'error'
      });
    } else {
      const now = new Date();
      if (date > now) {
        warnings.push({
          field: 'date',
          message: 'Date is in the future',
          severity: 'warning'
        });
      }
    }
  }

  // 标签验证
  if (metadata.tags) {
    if (!Array.isArray(metadata.tags)) {
      errors.push({
        field: 'tags',
        message: 'Tags must be an array',
        severity: 'error'
      });
    } else {
      if (metadata.tags.length === 0) {
        warnings.push({
          field: 'tags',
          message: 'No tags specified (recommended: at least 1-3 tags)',
          severity: 'warning'
        });
      }
      
      if (metadata.tags.length > 10) {
        warnings.push({
          field: 'tags',
          message: 'Too many tags (recommended: less than 10 tags)',
          severity: 'warning'
        });
      }

      // 检查标签格式
      metadata.tags.forEach((tag, index) => {
        if (typeof tag !== 'string') {
          errors.push({
            field: `tags[${index}]`,
            message: 'Tag must be a string',
            severity: 'error'
          });
        } else if (tag.length < 2) {
          warnings.push({
            field: `tags[${index}]`,
            message: 'Tag is too short',
            severity: 'warning'
          });
        } else if (tag.length > 30) {
          warnings.push({
            field: `tags[${index}]`,
            message: 'Tag is too long',
            severity: 'warning'
          });
        }
      });
    }
  }

  // 阅读时间验证
  if (metadata.readingTime !== undefined) {
    if (typeof metadata.readingTime !== 'number' || metadata.readingTime < 1) {
      warnings.push({
        field: 'readingTime',
        message: 'Reading time should be a positive number',
        severity: 'warning'
      });
    }
  }

  // 封面图片验证
  if (metadata.coverImage) {
    if (!isValidImageUrl(metadata.coverImage)) {
      warnings.push({
        field: 'coverImage',
        message: 'Cover image URL may not be valid',
        severity: 'warning'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// 验证Markdown内容
export function validateMarkdownContent(content: string, filePath: string): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 内容长度验证
  if (content.length < 100) {
    warnings.push({
      field: 'content',
      message: 'Content is very short (recommended: at least 100 characters)',
      severity: 'warning'
    });
  }

  // 检查是否有标题
  const hasH1 = /^#\s+.+$/m.test(content);
  if (!hasH1) {
    warnings.push({
      field: 'content',
      message: 'Content should have at least one H1 heading',
      severity: 'warning'
    });
  }

  // 检查代码块
  const codeBlocks = content.match(/```[\s\S]*?```/g);
  if (codeBlocks) {
    codeBlocks.forEach((block, index) => {
      if (!block.match(/```\w+/)) {
        warnings.push({
          field: `codeBlock[${index}]`,
          message: 'Code block should specify a language for syntax highlighting',
          severity: 'warning'
        });
      }
    });
  }

  // 检查图片链接
  const imageLinks = content.match(/!\[.*?\]\(.*?\)/g);
  if (imageLinks) {
    imageLinks.forEach((link, index) => {
      const urlMatch = link.match(/\((.*?)\)/);
      if (urlMatch && urlMatch[1]) {
        const url = urlMatch[1];
        if (!isValidImageUrl(url) && !url.startsWith('/')) {
          warnings.push({
            field: `image[${index}]`,
            message: `Image URL may not be valid: ${url}`,
            severity: 'warning'
          });
        }
      }
    });
  }

  // 检查外部链接
  const externalLinks = content.match(/\[.*?\]\(https?:\/\/.*?\)/g);
  if (externalLinks) {
    externalLinks.forEach((link, index) => {
      const urlMatch = link.match(/\((https?:\/\/.*?)\)/);
      if (urlMatch && urlMatch[1]) {
        const url = urlMatch[1];
        if (!isValidUrl(url)) {
          warnings.push({
            field: `link[${index}]`,
            message: `External link may not be valid: ${url}`,
            severity: 'warning'
          });
        }
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// 验证完整的博客文章
export function validateBlogPost(
  metadata: Partial<BlogMetadata>, 
  content: string, 
  filePath: string
): ValidationResult {
  const metadataResult = validateBlogMetadata(metadata, filePath);
  const contentResult = validateMarkdownContent(content, filePath);

  return {
    isValid: metadataResult.isValid && contentResult.isValid,
    errors: [...metadataResult.errors, ...contentResult.errors],
    warnings: [...metadataResult.warnings, ...contentResult.warnings]
  };
}

// 辅助函数：验证图片URL
function isValidImageUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => 
      parsedUrl.pathname.toLowerCase().endsWith(ext)
    );
  } catch {
    return false;
  }
}

// 辅助函数：验证URL
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// 生成验证报告
export function generateValidationReport(results: ValidationResult[]): string {
  const totalFiles = results.length;
  const validFiles = results.filter(r => r.isValid).length;
  const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);

  let report = `# Blog Content Validation Report\n\n`;
  report += `**Summary:**\n`;
  report += `- Total files: ${totalFiles}\n`;
  report += `- Valid files: ${validFiles}\n`;
  report += `- Files with errors: ${totalFiles - validFiles}\n`;
  report += `- Total errors: ${totalErrors}\n`;
  report += `- Total warnings: ${totalWarnings}\n\n`;

  if (totalErrors > 0 || totalWarnings > 0) {
    report += `## Issues Found\n\n`;
    
    results.forEach((result, index) => {
      if (result.errors.length > 0 || result.warnings.length > 0) {
        report += `### File ${index + 1}\n\n`;
        
        if (result.errors.length > 0) {
          report += `**Errors:**\n`;
          result.errors.forEach(error => {
            report += `- ${error.field}: ${error.message}\n`;
          });
          report += `\n`;
        }
        
        if (result.warnings.length > 0) {
          report += `**Warnings:**\n`;
          result.warnings.forEach(warning => {
            report += `- ${warning.field}: ${warning.message}\n`;
          });
          report += `\n`;
        }
      }
    });
  }

  return report;
}