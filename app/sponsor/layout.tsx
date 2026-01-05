import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-stone-900">Study Platform</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/sponsor"
                className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/sponsor/studies"
                className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
              >
                Studies
              </Link>
            </nav>

            {/* User menu placeholder */}
            <div className="flex items-center gap-4">
              <button className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>
    </div>
  )
}
