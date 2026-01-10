'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { NofOneLogo } from '@/components/ui/NofOneLogo'

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 px-6 flex items-center justify-between bg-[rgba(10,10,10,0.8)] backdrop-blur-xl border-b border-[var(--glass-border)]">
        <NofOneLogo showText size={32} />
        <nav className="hidden sm:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm font-medium text-[var(--text-tertiary)] hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="/protocols" className="text-sm font-medium text-[var(--text-tertiary)] hover:text-white transition-colors">
            Protocols
          </Link>
          <Link href="/sponsor" className="text-sm font-medium text-[var(--text-tertiary)] hover:text-white transition-colors">
            Enterprise
          </Link>
          <Link
            href="/sponsor/create"
            className="px-5 py-2.5 bg-[var(--primary)] text-[#0A0A0A] rounded-lg font-semibold text-sm hover:bg-[var(--primary-light)] hover:-translate-y-0.5 transition-all"
          >
            Start your protocol
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center pt-16 pb-20 px-6 relative overflow-hidden">
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            maskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 0%, transparent 70%)',
          }}
        />

        {/* Coral glow */}
        <div
          className="absolute top-1/5 right-[10%] w-[500px] h-[500px] rounded-full pointer-events-none animate-pulse"
          style={{
            background: 'radial-gradient(circle, rgba(234,88,12,0.4) 0%, transparent 70%)',
            opacity: 0.15,
          }}
        />

        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-20 items-center relative z-10">
          {/* Left - Content */}
          <div className="max-w-xl animate-fade-in">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-blink" />
              <span className="text-[13px] font-medium text-[#D1D5DB]">Personal science, validated</span>
            </div>

            {/* Headline */}
            <h1 className="text-[clamp(48px,6vw,72px)] font-bold leading-[1.05] tracking-[-0.03em] mb-6">
              Study <span className="text-[var(--primary)] relative inline-block">
                yourself
                <span className="absolute bottom-1 left-0 right-0 h-0.5 bg-[var(--primary)] opacity-40 rounded" />
              </span>.
              <br />
              Measure what matters.
            </h1>

            {/* Subheadline */}
            <p className="text-lg leading-relaxed text-[#9CA3AF] mb-10 max-w-[480px]">
              Design a protocol. Collect your data. See your results.
              <strong className="text-[#D1D5DB] font-medium"> Your N of 1 study</strong> joins thousands of others to reveal what actually works.
            </p>

            {/* CTAs */}
            <div className="flex gap-4 mb-16">
              <Link
                href="/sponsor/create"
                className="group inline-flex items-center gap-2.5 px-7 py-4 bg-[var(--primary)] text-[#0A0A0A] rounded-xl font-semibold text-base shadow-[0_0_0_0_rgba(234,88,12,0.4)] hover:bg-[var(--primary-light)] hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_rgba(234,88,12,0.4)] transition-all duration-200"
              >
                Start your protocol
                <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/protocols"
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-[var(--glass-bg)] text-white rounded-xl font-medium text-base border border-[var(--glass-border)] backdrop-blur-sm hover:bg-[var(--glass-bg-hover)] hover:border-[rgba(255,255,255,0.15)] transition-all"
              >
                Browse protocols
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-12">
              <div className="flex flex-col gap-1">
                <div className="font-mono text-[28px] font-medium text-white tracking-[-0.02em]">
                  <span className="text-[var(--primary)]">12,847</span>
                </div>
                <div className="text-[13px] text-[#6B7280] uppercase tracking-[0.05em]">Active protocols</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-mono text-[28px] font-medium text-white tracking-[-0.02em]">847K</div>
                <div className="text-[13px] text-[#6B7280] uppercase tracking-[0.05em]">Data points collected</div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="font-mono text-[28px] font-medium text-white tracking-[-0.02em]">94%</div>
                <div className="text-[13px] text-[#6B7280] uppercase tracking-[0.05em]">Completion rate</div>
              </div>
            </div>
          </div>

          {/* Right - Data Visualization Cards */}
          <div className="relative h-[500px] hidden lg:block">
            {/* Main chart card */}
            <div
              className="absolute top-10 left-0 right-10 h-80 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 hover:bg-[var(--glass-bg-hover)] hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all animate-fade-in-up"
              style={{ animationDelay: '0.4s', animation: 'fade-in-up 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards, float 6s ease-in-out infinite' }}
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <div className="text-sm font-medium text-[#9CA3AF]">Your Response Score</div>
                  <div className="font-mono text-[32px] font-semibold text-[var(--primary)] mt-1">+34%</div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[rgba(34,197,94,0.15)] rounded-full text-xs font-semibold text-[#22C55E]">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 8L5 5L7 7L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Improving
                </div>
              </div>

              {/* Chart */}
              <div className="relative h-44 mt-4">
                <span className="absolute left-0 top-[65%] text-[10px] text-[#6B7280] uppercase tracking-[0.05em]">Baseline</span>
                <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                  {/* Baseline grid line */}
                  <line x1="0" y1="97" x2="400" y2="97" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>

                  {/* Collective data area */}
                  <path d="M0,120 Q50,115 100,105 T200,95 T300,85 T400,70 L400,150 L0,150 Z" fill="rgba(107,114,128,0.1)"/>
                  <path d="M0,120 Q50,115 100,105 T200,95 T300,85 T400,70" fill="none" stroke="rgba(107,114,128,0.3)" strokeWidth="2"/>

                  {/* Your data line */}
                  <path d="M0,110 Q50,105 100,85 T200,60 T300,45 T400,25" fill="none" stroke="#EA580C" strokeWidth="3" strokeLinecap="round"/>

                  {/* Data points */}
                  <circle cx="0" cy="110" r="4" fill="#EA580C"/>
                  <circle cx="100" cy="85" r="4" fill="#EA580C"/>
                  <circle cx="200" cy="60" r="4" fill="#EA580C"/>
                  <circle cx="300" cy="45" r="4" fill="#EA580C"/>
                  <circle cx="400" cy="25" r="6" fill="#EA580C">
                    <animate attributeName="r" values="6;8;6" dur="2s" repeatCount="indefinite"/>
                  </circle>

                  {/* Glow effect */}
                  <circle cx="400" cy="25" r="12" fill="rgba(234,88,12,0.2)">
                    <animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="opacity" values="0.3;0.1;0.3" dur="2s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </div>
            </div>

            {/* Your result card */}
            <div
              className="absolute bottom-0 left-5 w-52 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 hover:bg-[var(--glass-bg-hover)] hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all animate-fade-in-up"
              style={{ animation: 'fade-in-up 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards, float 6s ease-in-out infinite -2s' }}
            >
              <div className="flex items-center gap-3 py-3 border-b border-[var(--glass-border)]">
                <div className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] shadow-[0_0_12px_rgba(234,88,12,0.4)]" />
                <div className="flex-1">
                  <div className="text-xs text-[#9CA3AF]">Your result</div>
                  <div className="font-mono text-base font-medium text-[var(--primary)]">Week 8: 78</div>
                </div>
              </div>
              <div className="flex items-center gap-3 py-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#6B7280]" />
                <div className="flex-1">
                  <div className="text-xs text-[#9CA3AF]">Collective avg</div>
                  <div className="font-mono text-base font-medium text-white">Week 8: 62</div>
                </div>
              </div>
            </div>

            {/* Protocol card */}
            <div
              className="absolute bottom-16 right-0 w-56 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-2xl p-6 hover:bg-[var(--glass-bg-hover)] hover:border-[rgba(255,255,255,0.12)] hover:-translate-y-1 transition-all animate-fade-in-up"
              style={{ animation: 'fade-in-up 0.8s cubic-bezier(0.25,0.46,0.45,0.94) forwards, float 6s ease-in-out infinite -4s' }}
            >
              <div className="font-semibold text-[15px] text-white mb-1">Creatine + Cognition</div>
              <div className="text-xs text-[#6B7280] mb-4">12-week protocol</div>
              <div className="h-1 bg-[var(--glass-border)] rounded-full overflow-hidden mb-2">
                <div className="h-full w-[67%] bg-[var(--primary)] rounded-full" />
              </div>
              <div className="text-xs text-[#9CA3AF]">
                <span className="text-[var(--primary)] font-medium">Week 8</span> of 12
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-t border-[var(--glass-border)] bg-[var(--bg-elevated)] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">Your Response. Quantified.</h2>
            <p className="text-lg text-[#9CA3AF]">Run a rigorous self-experiment in three steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Choose a Protocol',
                description: 'Browse validated protocols or design your own. Measure sleep, supplements, diet, exercise, or any intervention.',
              },
              {
                step: '02',
                title: 'Record Your Data',
                description: 'Log entries on your schedule. Validated instruments ensure your data is meaningful and comparable.',
              },
              {
                step: '03',
                title: 'See Your Results',
                description: 'Visualize your personal response. Compare with aggregate data to see how your results stack up.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative p-8 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] hover:border-[var(--primary)]/30 transition-all"
              >
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
                  <span className="text-sm font-mono font-bold text-white">{item.step}</span>
                </div>
                <h3 className="font-semibold text-white text-lg mb-3">{item.title}</h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section className="border-t border-[var(--glass-border)] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full mb-6">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                <path d="M2 17l10 5 10-5"/>
                <path d="M2 12l10 5 10-5"/>
              </svg>
              <span className="text-sm font-medium text-[#D1D5DB]">AI Agents</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">Four Specialized Agents</h2>
            <p className="text-lg text-[#9CA3AF]">Working together to design, launch, and run your study</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Protocol Agent',
                description: 'Designs study endpoints, inclusion/exclusion criteria, PRO instruments, and safety thresholds.',
                color: '#3B82F6',
                bgColor: 'rgba(59, 130, 246, 0.15)',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                ),
              },
              {
                name: 'Consent Agent',
                description: 'Generates plain-language informed consent with comprehension verification.',
                color: '#22C55E',
                bgColor: 'rgba(34, 197, 94, 0.15)',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                ),
              },
              {
                name: 'Enrollment Agent',
                description: 'Guides participants through registration, consent, and eligibility screening.',
                color: '#A855F7',
                bgColor: 'rgba(168, 85, 247, 0.15)',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                    <circle cx="9" cy="7" r="4"/>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                  </svg>
                ),
              },
              {
                name: 'Engagement Agent',
                description: 'Sends personalized reminders and milestone messages to maximize retention.',
                color: '#EA580C',
                bgColor: 'rgba(234, 88, 12, 0.15)',
                icon: (
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                ),
              },
            ].map((agent) => (
              <div
                key={agent.name}
                className="p-6 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] hover:border-[rgba(255,255,255,0.12)] transition-all"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                  style={{ backgroundColor: agent.bgColor, color: agent.color }}
                >
                  {agent.icon}
                </div>
                <h3 className="font-semibold text-white text-base mb-2">{agent.name}</h3>
                <p className="text-sm text-[#9CA3AF] leading-relaxed">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* N of Many */}
      <section className="border-t border-[var(--glass-border)] bg-[var(--bg-elevated)] py-24 px-6">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--secondary)]/10 border border-[var(--secondary)]/20 rounded-full text-xs font-medium text-[var(--secondary)] mb-6">
              N of Many
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">Your Data. Amplified.</h2>
            <p className="text-[#9CA3AF] mb-8 leading-relaxed">
              When you run a study, your data joins thousands of others running the same protocol.
              See not just what works for you, but what works across populations.
            </p>
            <ul className="space-y-4">
              {[
                'Compare your response to the aggregate',
                'Discover what predicts success',
                'Contribute to collective knowledge',
              ].map((text) => (
                <li key={text} className="flex items-center gap-3 text-[#9CA3AF]">
                  <div className="w-6 h-6 bg-[var(--success)]/15 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[var(--glass-bg)] backdrop-blur-md border border-[var(--glass-border)] rounded-2xl p-8">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white">Response Distribution</span>
              <span className="text-xs text-[#6B7280]">n=1,247</span>
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
            <div className="flex items-center gap-6 pt-4 mt-4 border-t border-[var(--glass-border)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--primary)] rounded" />
                <span className="text-xs text-[#9CA3AF]">Your Result</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-[var(--glass-hover)] rounded" />
                <span className="text-xs text-[#9CA3AF]">Population</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-[var(--glass-border)] py-24 px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-4">
          Ready to learn what works for you?
        </h2>
        <p className="text-[#9CA3AF] mb-8 max-w-md mx-auto">
          Start your first N of 1 study today. No cost, no commitment.
        </p>
        <Link
          href="/sponsor/create"
          className="inline-flex items-center gap-2.5 px-8 py-4 bg-[var(--primary)] text-[#0A0A0A] rounded-xl font-semibold shadow-lg shadow-[var(--primary)]/25 hover:bg-[var(--primary-light)] hover:-translate-y-0.5 transition-all"
        >
          Start Your Protocol
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[var(--glass-border)] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <NofOneLogo size={24} />
          <div className="text-sm text-[#6B7280]">Personal science with collective insight.</div>
          <div className="flex items-center gap-6 text-sm text-[#6B7280]">
            <Link href="/sponsor" className="hover:text-[#9CA3AF] transition-colors">Enterprise</Link>
            <Link href="/admin" className="hover:text-[#9CA3AF] transition-colors">Admin</Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
