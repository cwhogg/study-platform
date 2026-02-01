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
  const items = getAllContent('comparison');
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug('comparison', slug);
  if (!item) return { title: 'Not Found' };

  return {
    title: `${item.meta.title} | N of One`,
    description: item.meta.description || `Read ${item.meta.title} on N of One.`,
    openGraph: {
      title: item.meta.title,
      description: item.meta.description || `Read ${item.meta.title} on N of One.`,
      type: 'article',
      url: `https://nofone.us/compare/${slug}`,
    },
    ...(item.meta.canonicalUrl && {
      alternates: { canonical: item.meta.canonicalUrl },
    }),
  };
}

export default async function ComparisonPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getContentBySlug('comparison', slug);

  if (!item) notFound();

  const url = `https://nofone.us/compare/${slug}`;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <JsonLd type="comparison" meta={item.meta} url={url} />

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

        <h1 className="heading-1 mb-4">{item.meta.title}</h1>

        <div className="flex items-center gap-3 mb-10 flex-wrap">
          {item.meta.generatedAt && (
            <span className="text-sm text-[var(--text-muted)]">
              {new Date(item.meta.generatedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          )}
          {item.meta.targetKeywords?.slice(0, 4).map((kw) => (
            <span key={kw} className="badge badge-neutral text-xs">
              {kw}
            </span>
          ))}
        </div>

        <MarkdownRenderer content={item.content} />
      </article>
    </div>
  );
}
