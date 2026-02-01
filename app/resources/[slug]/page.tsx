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
  const items = getAllContent('landing-page');
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getContentBySlug('landing-page', slug);
  if (!item) return { title: 'Not Found' };

  return {
    title: `${item.meta.title} | N of One`,
    description: item.meta.description || item.meta.title,
    openGraph: {
      title: item.meta.title,
      description: item.meta.description || item.meta.title,
      type: 'website',
      url: `https://nofone.us/resources/${slug}`,
    },
    ...(item.meta.canonicalUrl && {
      alternates: { canonical: item.meta.canonicalUrl },
    }),
  };
}

export default async function ResourcePage({ params }: PageProps) {
  const { slug } = await params;
  const item = getContentBySlug('landing-page', slug);

  if (!item) notFound();

  const url = `https://nofone.us/resources/${slug}`;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <JsonLd type="landing-page" meta={item.meta} url={url} />

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
        <h1 className="heading-1 mb-10">{item.meta.title}</h1>
        <MarkdownRenderer content={item.content} />
      </article>
    </div>
  );
}
