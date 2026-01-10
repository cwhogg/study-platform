import Link from 'next/link'
import { FileText, Users, BarChart3, Shield, ArrowRight, Target, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function SponsorPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[var(--primary)]/10 rounded-full blur-[128px] -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--secondary)]/5 rounded-full blur-[100px] translate-y-1/2" />

        <div className="relative container-wide py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary-dim)] border border-[var(--primary)]/20 rounded-full mb-8">
              <Target className="w-4 h-4 text-[var(--primary)]" />
              <span className="text-sm font-medium text-[var(--primary-light)]">Enterprise Platform</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-[var(--text-primary)] mb-6 text-balance leading-tight">
              Launch Protocols in Minutes
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
              Our AI agents generate complete study protocols, informed consent documents,
              and patient communications — tailored to your specific intervention.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sponsor/create"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-light)] text-white font-medium rounded-xl shadow-lg shadow-[var(--primary)]/25 hover:shadow-xl hover:-translate-y-0.5 transition-all group"
              >
                Create a Protocol
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/sponsor/studies"
                className="inline-flex items-center gap-2 px-8 py-4 bg-[var(--glass-bg)] text-[var(--text-primary)] font-medium rounded-xl border border-[var(--glass-border)] hover:bg-[var(--glass-hover)] transition-all"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[var(--glass-border)] bg-[var(--bg-elevated)]">
        <div className="container-wide py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-4">
              How It Works
            </h2>
            <p className="text-[var(--text-secondary)] text-lg max-w-xl mx-auto">
              From intervention to live protocol in four simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                icon: FileText,
                step: '01',
                title: 'Define Intervention',
                description: 'Enter the treatment or intervention you want to study. Our AI handles the rest.',
              },
              {
                icon: Shield,
                step: '02',
                title: 'AI Generates Protocol',
                description: 'Our Protocol Agent designs endpoints, PRO instruments, and safety thresholds.',
              },
              {
                icon: Users,
                step: '03',
                title: 'Invite Participants',
                description: 'Participants complete consent, screening, and baseline surveys on mobile.',
              },
              {
                icon: BarChart3,
                step: '04',
                title: 'Collect Data',
                description: 'Track outcomes with validated PRO instruments and integrate lab results.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative p-6 bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] hover:border-[var(--primary)]/30 transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-[var(--primary)] rounded-full flex items-center justify-center shadow-lg shadow-[var(--primary)]/30">
                  <span className="text-sm font-mono font-bold text-white">{item.step}</span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 bg-[var(--primary-dim)] rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[var(--primary)]" />
                </div>

                <h3 className="font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-[var(--glass-border)]">
        <div className="container-wide py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Feature list */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-full text-xs font-medium text-[var(--text-muted)] mb-6">
                Features
              </div>

              <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-8">
                AI-Powered Protocol Design
              </h2>

              <ul className="space-y-5">
                {[
                  {
                    title: 'Validated PRO Instruments',
                    description: 'qADAM, IIEF-5, PHQ-2, and other validated questionnaires selected for your intervention.',
                  },
                  {
                    title: 'Auto-Generated Consent',
                    description: 'Plain-language informed consent documents with comprehension verification.',
                  },
                  {
                    title: 'Safety Monitoring',
                    description: 'Automatic alerts when participants exceed safety thresholds on PROs or labs.',
                  },
                  {
                    title: 'Smart Engagement',
                    description: 'AI-crafted reminders and milestone messages to maximize participant retention.',
                  },
                ].map((feature) => (
                  <li key={feature.title} className="flex gap-4">
                    <div className="flex-shrink-0 w-6 h-6 bg-[var(--success)]/15 rounded-full flex items-center justify-center mt-0.5 border border-[var(--success)]/30">
                      <Check className="w-4 h-4 text-[var(--success)]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-[var(--text-primary)]">{feature.title}</h4>
                      <p className="text-sm text-[var(--text-secondary)] mt-1 leading-relaxed">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Example study card */}
            <div className="relative">
              {/* Decorative gradient */}
              <div className="absolute -inset-4 bg-[var(--primary)]/5 rounded-3xl blur-2xl" />

              <div className="relative bg-[var(--glass-bg)] backdrop-blur-md rounded-2xl border border-[var(--glass-border)] p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                    Example Protocol
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-[var(--success)] rounded-full animate-pulse" />
                    <span className="text-xs font-medium text-[var(--success)]">Active</span>
                  </div>
                </div>

                <h3 className="text-2xl font-semibold text-[var(--text-primary)] mb-6">
                  TRT Outcomes Study
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Duration', value: '26 weeks' },
                    { label: 'Endpoints', value: '4 validated' },
                    { label: 'Lab Markers', value: '3 tracked' },
                    { label: 'PRO Schedule', value: '9 timepoints' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 bg-[var(--glass-hover)] rounded-xl border border-[var(--glass-border)]">
                      <div className="text-xs text-[var(--text-muted)] mb-1">{stat.label}</div>
                      <div className="font-semibold text-[var(--text-primary)]">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-[var(--glass-border)]">
                  <div className="text-xs text-[var(--text-muted)] mb-3">Generated in</div>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-semibold text-[var(--primary)]">~2 min</div>
                    <div className="text-sm text-[var(--text-muted)]">by AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-[var(--glass-border)] bg-[var(--bg-elevated)]">
        <div className="relative container-wide py-16 sm:py-20 text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold text-[var(--text-primary)] mb-4">
            Ready to launch your protocol?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8 max-w-xl mx-auto text-lg">
            Get started in minutes. No protocol writing experience required.
          </p>
          <Link href="/sponsor/create">
            <Button size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Create Your First Protocol
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
