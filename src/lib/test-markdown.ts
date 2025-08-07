// 临时测试文件
import { getMarkdownFiles, parseMarkdownFile, renderMarkdown, extractTableOfContents } from './markdown';

export async function testMarkdownProcessing() {
  console.log('Testing Markdown processing...');
  
  // 测试获取文件列表
  const enFiles = getMarkdownFiles('en');
  console.log('English files:', enFiles);
  
  if (enFiles.length > 0) {
    // 测试解析第一个文件
    const { metadata, content, slug } = parseMarkdownFile(enFiles[0]);
    console.log('Parsed metadata:', metadata);
    console.log('Slug:', slug);
    
    // 测试渲染Markdown
    const htmlContent = await renderMarkdown(content);
    console.log('HTML content length:', htmlContent.length);
    
    // 测试提取目录
    const toc = extractTableOfContents(htmlContent);
    console.log('Table of contents:', toc);
  }
}