import Link from 'next/link'
import { FileText, Users, BarChart3, Shield, ArrowRight, Sparkles, Check } from 'lucide-react'

export default function SponsorPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-40 top-1/3 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative container-wide py-20 sm:py-28">
          <div className="max-w-3xl mx-auto text-center stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">AI-Powered Research Platform</span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-slate-100 mb-6 text-balance">
              Launch Clinical Studies in Minutes
            </h1>

            {/* Subheadline */}
            <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto text-balance leading-relaxed">
              Our AI agents generate complete study protocols, informed consent documents,
              and patient communications — tailored to your specific intervention.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/sponsor/create"
                className="btn btn-primary btn-lg group"
              >
                Create a Study
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/sponsor/studies"
                className="btn btn-secondary btn-lg"
              >
                View Your Studies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-slate-800">
        <div className="container-wide py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-slate-100 mb-4">
              How It Works
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              From intervention to live study in four simple steps
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
                description: 'Our Clinical Protocol Agent designs endpoints, PRO instruments, and safety thresholds.',
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
                className="group relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-indigo-500/30 hover:bg-slate-800 transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-2 w-10 h-10 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center">
                  <span className="text-sm font-mono font-semibold text-slate-400">{item.step}</span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform border border-indigo-500/20">
                  <item.icon className="w-6 h-6 text-indigo-400" />
                </div>

                <h3 className="font-semibold text-slate-100 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-slate-800/30 border-t border-slate-800">
        <div className="container-wide py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Feature list */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300 mb-6">
                Features
              </div>

              <h2 className="font-display text-3xl sm:text-4xl text-slate-100 mb-8">
                AI-Powered Study Design
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
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center mt-0.5 border border-emerald-500/30">
                      <Check className="w-4 h-4 text-emerald-400" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-100">{feature.title}</h4>
                      <p className="text-sm text-slate-400 mt-1 leading-relaxed">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: Example study card */}
            <div className="relative">
              {/* Decorative gradient */}
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 rounded-3xl blur-2xl" />

              <div className="relative bg-slate-800 rounded-2xl border border-slate-700 shadow-xl shadow-black/30 p-8">
                <div className="flex items-center justify-between mb-6">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Example Study
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full" />
                    <span className="text-xs font-medium text-emerald-400">Active</span>
                  </div>
                </div>

                <h3 className="font-display text-2xl text-slate-100 mb-6">
                  TRT Outcomes Study
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: 'Duration', value: '26 weeks' },
                    { label: 'Endpoints', value: '4 validated' },
                    { label: 'Lab Markers', value: '3 tracked' },
                    { label: 'PRO Schedule', value: '9 timepoints' },
                  ].map((stat) => (
                    <div key={stat.label} className="p-3 bg-slate-900 rounded-xl border border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                      <div className="font-semibold text-slate-100">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="pt-6 border-t border-slate-700">
                  <div className="text-xs text-slate-500 mb-3">Generated in</div>
                  <div className="flex items-center gap-2">
                    <div className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">~2 min</div>
                    <div className="text-sm text-slate-500">by AI</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-t border-slate-800">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5" />

        <div className="relative container-wide py-16 sm:py-20 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-slate-100 mb-4">
            Ready to launch your study?
          </h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto text-lg">
            Get started in minutes. No protocol writing experience required.
          </p>
          <Link
            href="/sponsor/create"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-medium rounded-2xl shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all"
          >
            Create Your First Study
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
