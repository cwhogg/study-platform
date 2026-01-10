import Link from 'next/link'
import { Activity, TrendingUp, Users, ArrowRight, ChevronRight, Target, BarChart3 } from 'lucide-react'
import { NofOneLogo } from '@/components/ui/NofOneLogo'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[var(--bg-primary)]/80 backdrop-blur-lg border-b border-[var(--glass-border)]">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            <NofOneLogo showText size={32} />
            <div className="flex items-center gap-4">
              <Link
                href="/enterprise"
                className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors hidden sm:block"
              >
                Enterprise
              </Link>
              <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider px-2 py-1 bg-[var(--glass-bg)] rounded-full border border-[var(--glass-border)]">
                Beta
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--primary)]/10 rounded-full blur-[128px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--secondary)]/5 rounded-full blur-[100px] translate-y-1/2" />

        <div className="relative container-wide pt-16 sm:pt-24 pb-20 sm:pb-32">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-dim)] border border-[var(--primary)]/20 rounded-full mb-8">
              <Target className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-medium text-[var(--primary-light)]">Personal Science Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--text-primary)] mb-6 leading-tight tracking-tight">
              Study Yourself.
              <br />
              <span className="text-[var(--primary)]">Measure What Matters.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-12 max-w-2xl mx-auto leading-relaxed">
              Design a protocol. Collect your data. See your results. Your N of 1 study
              joins thousands of others to reveal what actually works.
            </p>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/study"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] text-white font-medium rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:bg-[var(--primary-light)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Your Study
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/protocols"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--glass-bg)] text-[var(--text-primary)] font-medium rounded-xl border border-[var(--glass-border)] hover:bg-[var(--glass-hover)] hover:border-[var(--text-muted)] transition-all duration-200"
              >
                Browse Protocols
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] font-mono">2,847</div>
                <div className="text-xs sm:text-sm text-[var(--text-muted)]">Active Studies</div>
              </div>
              <div className="text-center border-x border-[var(--glass-border)]">
                <div className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] font-mono">156</div>
                <div className="text-xs sm:text-sm text-[var(--text-muted)]">Protocols</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] font-mono">89%</div>
                <div className="text-xs sm:text-sm text-[var(--text-muted)]">Completion</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[var(--glass-border)] bg-[var(--bg-elevated)]">
        <div className="container-wide py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-4">Your Response. Quantified.</h2>
            <p className="text-[var(--text-secondary)] text-lg">Run a rigorous self-experiment in three steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                step: '01',
                title: 'Choose a Protocol',
                description: 'Browse validated protocols or design your own. Measure sleep, supplements, diet, exercise, or any intervention.',
                icon: Target,
              },
              {
                step: '02',
                title: 'Collect Your Data',
                description: 'Log entries on your schedule. Validated instruments ensure your data is meaningful and comparable.',
                icon: Activity,
              },
              {
                step: '03',
                title: 'See Your Results',
                description: 'Visualize your personal response. Compare with aggregate data to see how your results stack up.',
                icon: TrendingUp,
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-6 sm:p-8 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] hover:border-[var(--primary)]/30 transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
                  <span className="text-sm font-mono font-bold text-white">{item.step}</span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 bg-[var(--primary-dim)] rounded-xl flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>

                <h3 className="font-semibold text-[var(--text-primary)] text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* N of Many */}
      <section className="border-t border-[var(--glass-border)]">
        <div className="container-wide py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-full text-xs font-medium text-[var(--secondary)] mb-6">
                <Users className="w-3.5 h-3.5" />
                N of Many
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-6">
                Your Data. Amplified.
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 leading-relaxed">
                When you run a study, your data joins thousands of others running the same protocol.
                See not just what works for you, but what works across populations. Real evidence,
                from real people, with real rigor.
              </p>
              <ul className="space-y-4">
                {[
                  'Compare your response to the aggregate',
                  'Discover what predicts success',
                  'Contribute to collective knowledge',
                ].map((text) => (
                  <li key={text} className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <div className="w-6 h-6 bg-[var(--success)]/15 rounded-full flex items-center justify-center flex-shrink-0">
                      <ChevronRight className="w-4 h-4 text-[var(--success)]" />
                    </div>
                    <span>{text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-2xl p-6 sm:p-8">
                {/* Chart mockup */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-[var(--text-primary)]">Response Distribution</span>
                    <span className="text-xs text-[var(--text-muted)]">n=1,247</span>
                  </div>
                  <div className="h-32 flex items-end gap-1">
                    {[15, 25, 45, 70, 85, 95, 100, 90, 75, 55, 35, 20, 10].map((height, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t transition-all duration-300"
                        style={{
                          height: `${height}%`,
                          backgroundColor: i === 7 ? 'var(--primary)' : 'var(--glass-hover)',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 pt-4 border-t border-[var(--glass-border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[var(--primary)] rounded" />
                    <span className="text-xs text-[var(--text-secondary)]">Your Result</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-[var(--glass-hover)] rounded" />
                    <span className="text-xs text-[var(--text-secondary)]">Population</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Protocols */}
      <section className="border-t border-[var(--glass-border)] bg-[var(--bg-elevated)]">
        <div className="container-wide py-20 sm:py-24">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-2">Popular Protocols</h2>
              <p className="text-[var(--text-secondary)]">Join validated studies designed by researchers</p>
            </div>
            <Link
              href="/protocols"
              className="hidden sm:inline-flex items-center gap-1.5 text-[var(--primary)] font-medium hover:gap-2.5 transition-all"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: 'Sleep Optimization',
                description: 'Track sleep quality, duration, and interventions over 8 weeks.',
                participants: 847,
                duration: '8 weeks',
              },
              {
                title: 'Supplement Response',
                description: 'Measure your response to supplements with validated outcomes.',
                participants: 1234,
                duration: '12 weeks',
              },
              {
                title: 'Mood & Energy',
                description: 'Daily tracking of mood, energy, and lifestyle factors.',
                participants: 562,
                duration: '4 weeks',
              },
            ].map((protocol) => (
              <Link
                key={protocol.title}
                href="/study"
                className="group p-6 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] hover:border-[var(--primary)]/40 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-[var(--primary-dim)] rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-[var(--primary)]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">{protocol.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-[var(--text-secondary)] mb-4 leading-relaxed">{protocol.description}</p>
                <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {protocol.participants.toLocaleString()}
                  </span>
                  <span>{protocol.duration}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/protocols"
              className="inline-flex items-center gap-1.5 text-[var(--primary)] font-medium"
            >
              View All Protocols
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--glass-border)]">
        <div className="container-wide py-20 sm:py-24 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-4">
            Ready to learn what works for you?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            Start your first N of 1 study today. No cost, no commitment.
          </p>
          <Link
            href="/study"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--primary)] text-white font-medium rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:bg-[var(--primary-light)] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
          >
            Start Your Study
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)]">
        <div className="container-wide py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <NofOneLogo size={24} />
            <div className="text-sm text-[var(--text-muted)]">
              Personal science with collective insight.
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--text-muted)]">
              <Link href="/enterprise" className="hover:text-[var(--text-secondary)] transition-colors">Enterprise</Link>
              <Link href="/admin" className="hover:text-[var(--text-secondary)] transition-colors">Admin</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
