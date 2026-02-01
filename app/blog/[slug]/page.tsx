import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAllContent, getContentBySlug } from '@/lib/content';
import MarkdownRenderer from '@/components/content/MarkdownRenderer';
import JsonLd from '@/components/content/JsonLd';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = getAllContent('blog-post');
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getContentBySlug('blog-post', slug);
  if (!post) return { title: 'Not Found' };

  return {
    title: `${post.meta.title} | N of One`,
    description: post.meta.description || `Read ${post.meta.title} on N of One.`,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description || `Read ${post.meta.title} on N of One.`,
      type: 'article',
      url: `https://nofone.us/blog/${slug}`,
      publishedTime: post.meta.generatedAt,
    },
    ...(post.meta.canonicalUrl && {
      alternates: { canonical: post.meta.canonicalUrl },
    }),
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getContentBySlug('blog-post', slug);

  if (!post) notFound();

  const url = `https://nofone.us/blog/${slug}`;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <JsonLd type="blog-post" meta={post.meta} url={url} />

      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--glass-border)]">
        <Link href="/" className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors">
          N of One
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/blog" className="text-sm font-medium text-[var(--text-tertiary)] hover:text-white transition-colors">
            Blog
          </Link>
          <Link href="/create" className="px-4 py-2 bg-[var(--primary)] text-[#0A0A0A] rounded-lg font-semibold text-sm hover:bg-[var(--primary-light)] transition-all">
            Create a protocol
          </Link>
        </nav>
      </header>

      <article className="container-base py-16">
        <Link href="/blog" className="text-sm text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors mb-8 inline-block">
          &larr; Back to blog
        </Link>

        <h1 className="heading-1 mb-4">{post.meta.title}</h1>

        <div className="flex items-center gap-3 mb-10 flex-wrap">
          {post.meta.generatedAt && (
            <span className="text-sm text-[var(--text-muted)]">
              {new Date(post.meta.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {post.meta.targetKeywords?.slice(0, 4).map((kw) => (
            <span key={kw} className="badge badge-neutral text-xs">
              {kw}
            </span>
          ))}
        </div>

        <MarkdownRenderer content={post.content} />
      </article>
    </div>
  );
}
