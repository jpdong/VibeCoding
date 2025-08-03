import fs from 'fs';
import path from 'path';
import { 
  parseMarkdownFile, 
  renderMarkdown, 
  extractTableOfContents,
  generateSlug,
  isValidDate,
  MarkdownError
} from '~/lib/markdown';
import { createMockMarkdownFile, createMockBlogMetadata } from '../factories/blog.factory';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

describe('Markdown Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('parseMarkdownFile', () => {
    it('parses valid markdown file correctly', () => {
      const metadata = createMockBlogMetadata({
        title: 'Test Article',
        description: 'Test description',
        date: '2024-01-15',
        author: 'Test Author'
      });
      
      const content = '# Test Content\n\nThis is test content.';
      const markdownContent = createMockMarkdownFile(metadata, content);
      
      mockFs.readFileSync.mockReturnValue(markdownContent);
      
      const result = parseMarkdownFile('/test/path/2024-01-15-test-article.md');
      
      expect(result.metadata.title).toBe('Test Article');
      expect(result.metadata.description).toBe('Test description');
      expect(result.metadata.date).toBe('2024-01-15');
      expect(result.metadata.author).toBe('Test Author');
      expect(result.content).toBe(content);
      expect(result.slug).toBe('test-article');
    });

    it('generates slug from filename correctly', () => {
      const metadata = createMockBlogMetadata();
      const content = '# Test';
      const markdownContent = createMockMarkdownFile(metadata, content);
      
      mockFs.readFileSync.mockReturnValue(markdownContent);
      
      const result = parseMarkdownFile('/test/2024-01-15-my-awesome-post.md');
      expect(result.slug).toBe('my-awesome-post');
    });

    it('calculates reading time automatically', () => {
      const metadata = createMockBlogMetadata();
      // Create content that should take about 2 minutes to read (400 words)
      const content = Array(400).fill('word').join(' ');
      const markdownContent = createMockMarkdownFile(metadata, content);
      
      mockFs.readFileSync.mockReturnValue(markdownContent);
      
      const result = parseMarkdownFile('/test/test.md');
      expect(result.metadata.readingTime).toBeGreaterThan(1);
    });

    it('throws MarkdownError for missing required fields', () => {
      const incompleteMetadata = {
        title: 'Test',
        // missing description, date, author
      };
      
      const markdownContent = createMockMarkdownFile(incompleteMetadata as any, '# Test');
      mockFs.readFileSync.mockReturnValue(markdownContent);
      
      expect(() => parseMarkdownFile('/test/test.md')).toThrow(MarkdownError);
    });

    it('handles file read errors', () => {
      mockFs.readFileSync.mockImplementation(() => {
        throw new Error('File not found');
      });
      
      expect(() => parseMarkdownFile('/nonexistent/file.md')).toThrow(MarkdownError);
    });

    it('provides default values for optional fields', () => {
      const minimalMetadata = {
        title: 'Test',
        description: 'Test description',
        date: '2024-01-15',
        author: 'Test Author'
      };
      
      const markdownContent = createMockMarkdownFile(minimalMetadata as any, '# Test');
      mockFs.readFileSync.mockReturnValue(markdownContent);
      
      const result = parseMarkdownFile('/test/test.md');
      
      expect(result.metadata.tags).toEqual([]);
      expect(result.metadata.category).toBe('General');
      expect(result.metadata.featured).toBe(false);
      expect(result.metadata.draft).toBe(false);
    });
  });

  describe('renderMarkdown', () => {
    it('renders basic markdown to HTML', async () => {
      const markdown = '# Heading\n\nThis is a paragraph with **bold** text.';
      const html = await renderMarkdown(markdown);
      
      expect(html).toContain('<h1');
      expect(html).toContain('Heading');
      expect(html).toContain('<p>');
      expect(html).toContain('<strong>bold</strong>');
    });

    it('renders code blocks with syntax highlighting', async () => {
      const markdown = '```javascript\nconst x = 1;\n```';
      const html = await renderMarkdown(markdown);
      
      expect(html).toContain('<pre>');
      expect(html).toContain('<code');
      expect(html).toContain('const x = 1;');
    });

    it('adds IDs to headings', async () => {
      const markdown = '# Main Heading\n## Sub Heading';
      const html = await renderMarkdown(markdown);
      
      expect(html).toContain('id=');
    });

    it('handles GFM features like tables', async () => {
      const markdown = `
| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
      `;
      
      const html = await renderMarkdown(markdown);
      
      expect(html).toContain('<table');
      expect(html).toContain('<th>');
      expect(html).toContain('<td>');
    });

    it('handles rendering errors gracefully', async () => {
      // This should not throw, even with potentially problematic content
      const problematicMarkdown = '# Heading\n\n<script>alert("xss")</script>';
      
      await expect(renderMarkdown(problematicMarkdown)).resolves.toBeDefined();
    });
  });

  describe('extractTableOfContents', () => {
    it('extracts headings from HTML correctly', () => {
      const html = `
        <h1 id="main-heading">Main Heading</h1>
        <h2 id="sub-heading-1">Sub Heading 1</h2>
        <h3 id="sub-sub-heading">Sub Sub Heading</h3>
        <h2 id="sub-heading-2">Sub Heading 2</h2>
      `;
      
      const toc = extractTableOfContents(html);
      
      expect(toc).toHaveLength(3); // h1 and 2 h2s at root level
      expect(toc[0].title).toBe('Main Heading');
      expect(toc[0].level).toBe(1);
      expect(toc[1].title).toBe('Sub Heading 1');
      expect(toc[1].children).toHaveLength(1);
      expect(toc[1].children![0].title).toBe('Sub Sub Heading');
    });

    it('handles empty HTML', () => {
      const toc = extractTableOfContents('');
      expect(toc).toEqual([]);
    });

    it('strips HTML tags from heading titles', () => {
      const html = '<h1 id="test">Heading with <strong>bold</strong> text</h1>';
      const toc = extractTableOfContents(html);
      
      expect(toc[0].title).toBe('Heading with bold text');
    });

    it('builds nested structure correctly', () => {
      const html = `
        <h1 id="h1">H1</h1>
        <h2 id="h2-1">H2-1</h2>
        <h3 id="h3-1">H3-1</h3>
        <h3 id="h3-2">H3-2</h3>
        <h2 id="h2-2">H2-2</h2>
      `;
      
      const toc = extractTableOfContents(html);
      
      expect(toc).toHaveLength(1); // Only H1 at root
      expect(toc[0].children).toHaveLength(2); // Two H2s
      expect(toc[0].children![0].children).toHaveLength(2); // Two H3s under first H2
      expect(toc[0].children![1].children).toBeUndefined(); // No children under second H2
    });
  });

  describe('generateSlug', () => {
    it('converts title to URL-friendly slug', () => {
      expect(generateSlug('Hello World')).toBe('hello-world');
      expect(generateSlug('My Awesome Blog Post!')).toBe('my-awesome-blog-post');
      expect(generateSlug('Special Characters: @#$%')).toBe('special-characters');
    });

    it('handles multiple spaces and dashes', () => {
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces');
      expect(generateSlug('Multiple---Dashes')).toBe('multiple-dashes');
    });

    it('removes leading and trailing spaces', () => {
      expect(generateSlug('  Trimmed  ')).toBe('trimmed');
    });

    it('handles empty strings', () => {
      expect(generateSlug('')).toBe('');
      expect(generateSlug('   ')).toBe('');
    });
  });

  describe('isValidDate', () => {
    it('validates correct date formats', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('2024/01/15')).toBe(true);
    });

    it('rejects invalid date formats', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2024-13-01')).toBe(false);
      expect(isValidDate('2024-01-32')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });

    it('handles edge cases', () => {
      expect(isValidDate('2024-02-29')).toBe(true); // Leap year
      expect(isValidDate('2023-02-29')).toBe(false); // Not a leap year
    });
  });
});