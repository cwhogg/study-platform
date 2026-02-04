import { ContentMeta } from '@/lib/content';

interface JsonLdProps {
  type: 'blog-post' | 'comparison' | 'faq' | 'landing-page';
  meta: ContentMeta;
  content?: string;
  url: string;
}

function buildArticleSchema(meta: ContentMeta, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: meta.title,
    description: meta.description || '',
    datePublished: meta.date || meta.generatedAt || new Date().toISOString(),
    url,
    author: {
      '@type': 'Organization',
      name: 'N of One',
      url: 'https://nofone.us',
    },
    publisher: {
      '@type': 'Organization',
      name: 'N of One',
      url: 'https://nofone.us',
    },
    ...(meta.targetKeywords?.length && { keywords: meta.targetKeywords.join(', ') }),
  };
}

function buildFAQSchema(meta: ContentMeta, content: string) {
  // Extract Q&A pairs from markdown content
  const questions: { name: string; text: string }[] = [];
  const lines = content.split('\n');
  let currentQuestion = '';
  let currentAnswer: string[] = [];

  for (const line of lines) {
    // Match headings that look like questions (contain ?)
    const headingMatch = line.match(/^#{2,4}\s+(.+\?)\s*$/);
    if (headingMatch) {
      if (currentQuestion && currentAnswer.length > 0) {
        questions.push({
          name: currentQuestion,
          text: currentAnswer.join(' ').trim(),
        });
      }
      currentQuestion = headingMatch[1];
      currentAnswer = [];
    } else if (currentQuestion && line.trim() && !line.startsWith('#')) {
      currentAnswer.push(line.trim());
    }
  }

  // Push last question
  if (currentQuestion && currentAnswer.length > 0) {
    questions.push({
      name: currentQuestion,
      text: currentAnswer.join(' ').trim(),
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: questions.map((q) => ({
      '@type': 'Question',
      name: q.name,
      acceptedAnswer: {
        '@type': 'Answer',
        text: q.text,
      },
    })),
  };
}

function buildWebPageSchema(meta: ContentMeta, url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: meta.title,
    description: meta.description || '',
    url,
    publisher: {
      '@type': 'Organization',
      name: 'N of One',
      url: 'https://nofone.us',
    },
  };
}

export default function JsonLd({ type, meta, content, url }: JsonLdProps) {
  let schema;

  switch (type) {
    case 'blog-post':
    case 'comparison':
      schema = buildArticleSchema(meta, url);
      break;
    case 'faq':
      schema = buildFAQSchema(meta, content || '');
      break;
    case 'landing-page':
      schema = buildWebPageSchema(meta, url);
      break;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
