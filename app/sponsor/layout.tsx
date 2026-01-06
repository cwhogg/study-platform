import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-100">Proove Platform</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/sponsor"
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/sponsor/studies"
                className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
              >
                Studies
              </Link>
            </nav>

            {/* User menu placeholder */}
            <div className="flex items-center gap-4">
              <button className="text-sm text-slate-400 hover:text-slate-100 transition-colors">
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
