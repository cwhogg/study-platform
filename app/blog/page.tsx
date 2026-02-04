import { Metadata } from 'next';
import Link from 'next/link';
import { getAllContent } from '@/lib/content';

export const metadata: Metadata = {
  title: 'Blog | N of One',
  description: 'Articles on personal science, self-experimentation, quantified self, and N-of-1 clinical studies.',
  openGraph: {
    title: 'Blog | N of One',
    description: 'Articles on personal science, self-experimentation, quantified self, and N-of-1 clinical studies.',
    type: 'website',
    url: 'https://nofone.us/blog',
  },
};

export default function BlogPage() {
  const posts = getAllContent('blog-post');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-[var(--glass-border)]">
        <Link href="/" className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors">
          N of One
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/blog" className="text-sm font-medium text-[var(--primary)]">
            Blog
          </Link>
          <Link href="/protocols" className="text-sm font-medium text-[var(--text-tertiary)] hover:text-white transition-colors">
            Protocols
          </Link>
          <Link href="/create" className="px-4 py-2 bg-[var(--primary)] text-[#0A0A0A] rounded-lg font-semibold text-sm hover:bg-[var(--primary-light)] transition-all">
            Create a protocol
          </Link>
        </nav>
      </header>

      <div className="container-base py-16">
        <h1 className="heading-1 mb-4">Blog</h1>
        <p className="text-[var(--text-secondary)] text-lg mb-12 max-w-2xl">
          Research, guides, and insights on personal science and self-experimentation.
        </p>

        {posts.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-[var(--text-tertiary)]">No posts published yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="card card-interactive p-6 block"
              >
                <h2 className="heading-3 mb-2">{post.meta.title}</h2>
                {post.meta.description && (
                  <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                    {post.meta.description}
                  </p>
                )}
                <div className="flex items-center gap-3 flex-wrap">
                  {(post.meta.date || post.meta.generatedAt) && (
                    <span className="text-xs text-[var(--text-muted)]">
                      {new Date(post.meta.date || post.meta.generatedAt!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                  {post.meta.targetKeywords?.slice(0, 3).map((kw) => (
                    <span key={kw} className="badge badge-neutral text-xs">
                      {kw}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
