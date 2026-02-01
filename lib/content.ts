import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export interface ContentMeta {
  title: string;
  slug: string;
  type: string;
  description?: string;
  targetKeywords?: string[];
  contentGap?: string;
  generatedAt?: string;
  ideaName?: string;
  status?: string;
  wordCount?: number;
  canonicalUrl?: string;
  [key: string]: unknown;
}

export interface ContentItem {
  slug: string;
  meta: ContentMeta;
  content: string;
}

const CONTENT_DIR = path.join(process.cwd(), 'content');

const TYPE_TO_DIR: Record<string, string> = {
  'blog-post': 'blog',
  'landing-page': 'landing-page',
  'comparison': 'comparison',
  'faq': 'faq',
};

function getContentDir(type: string): string {
  const dir = TYPE_TO_DIR[type] || type;
  return path.join(CONTENT_DIR, dir);
}

export function getAllContent(type: string): ContentItem[] {
  const dir = getContentDir(type);

  if (!fs.existsSync(dir)) return [];

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  const items = files.map((filename) => {
    const filePath = path.join(dir, filename);
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    const slug = filename
      .replace(/\.md$/, '')
      .replace(/^(blog|landing-page|comparison|faq)-/, '');

    return {
      slug,
      meta: { slug, ...data } as ContentMeta,
      content,
    };
  });

  // Only return published items, sorted by generatedAt descending
  return items
    .filter((item) => item.meta.status === 'published')
    .sort((a, b) => {
      const dateA = a.meta.generatedAt ? new Date(a.meta.generatedAt).getTime() : 0;
      const dateB = b.meta.generatedAt ? new Date(b.meta.generatedAt).getTime() : 0;
      return dateB - dateA;
    });
}

export function getContentBySlug(type: string, slug: string): ContentItem | null {
  const dir = getContentDir(type);

  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));

  for (const filename of files) {
    const fileSlug = filename
      .replace(/\.md$/, '')
      .replace(/^(blog|landing-page|comparison|faq)-/, '');

    if (fileSlug === slug) {
      const filePath = path.join(dir, filename);
      const raw = fs.readFileSync(filePath, 'utf-8');
      const { data, content } = matter(raw);

      return {
        slug,
        meta: { slug, ...data } as ContentMeta,
        content,
      };
    }
  }

  return null;
}

export function getAllPublishedSlugs(): { type: string; slug: string }[] {
  const types = Object.keys(TYPE_TO_DIR);
  const slugs: { type: string; slug: string }[] = [];

  for (const type of types) {
    const items = getAllContent(type);
    for (const item of items) {
      slugs.push({ type, slug: item.slug });
    }
  }

  return slugs;
}
