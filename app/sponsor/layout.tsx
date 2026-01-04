import Link from 'next/link'

export default function SponsorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/sponsor" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="font-semibold text-gray-900">Study Platform</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-6">
              <Link
                href="/sponsor"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/sponsor/studies"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Studies
              </Link>
            </nav>

            {/* User menu placeholder */}
            <div className="flex items-center gap-4">
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
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
