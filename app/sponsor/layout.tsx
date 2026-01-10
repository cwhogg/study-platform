import Link from 'next/link'
import { NofOneLogo } from '@/components/ui/NofOneLogo'

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--glass-border)]">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <NofOneLogo size={32} showText />
            </Link>

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/sponsor/studies"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/sponsor/create"
                className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Create Protocol
              </Link>
            </nav>

            {/* Enterprise badge */}
            <div className="flex items-center gap-4">
              <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 bg-[var(--glass-bg)] rounded-full border border-[var(--glass-border)]">
                Enterprise
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}
