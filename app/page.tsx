import Link from 'next/link'
import { FileText, Users, BarChart3, Shield, Clipboard, Bell, ArrowRight, Sparkles, Zap, Check } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-stone-100">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-sm">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-stone-900">Study Platform</span>
            </div>
            <div className="text-xs font-medium text-stone-400 uppercase tracking-wider">Demo Mode</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-stone-50 to-white">
        {/* Decorative elements */}
        <div className="absolute -right-40 -top-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute -left-40 top-1/2 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />

        <div className="relative container-wide py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 border border-teal-100 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">AI-Powered Clinical Research</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-stone-900 mb-6 text-balance">
              Observational Studies,{' '}
              <span className="text-teal-600">Simplified</span>
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 mb-12 max-w-2xl mx-auto text-balance leading-relaxed">
              Launch clinical observational studies in minutes with AI-powered protocol generation.
              Collect real-world patient outcomes with validated PRO instruments.
            </p>

            {/* Two Path Options */}
            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              {/* Sponsor Path */}
              <Link
                href="/sponsor"
                className="group bg-white p-7 rounded-2xl border border-stone-200 hover:border-teal-300 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-teal-500/5 text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <FileText className="w-7 h-7 text-teal-600" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900 mb-2">Create a Study</h2>
                <p className="text-stone-500 text-sm mb-4 leading-relaxed">
                  Design and launch an observational study with AI-generated protocols.
                </p>
                <span className="inline-flex items-center gap-1.5 text-teal-600 font-medium text-sm group-hover:gap-2.5 transition-all">
                  Sponsor Demo
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* Participant Path */}
              <Link
                href="/study"
                className="group bg-white p-7 rounded-2xl border border-stone-200 hover:border-teal-300 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-teal-500/5 text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Clipboard className="w-7 h-7 text-violet-600" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900 mb-2">Join a Study</h2>
                <p className="text-stone-500 text-sm mb-4 leading-relaxed">
                  Experience the participant flow: consent, screening, and PRO surveys.
                </p>
                <span className="inline-flex items-center gap-1.5 text-violet-600 font-medium text-sm group-hover:gap-2.5 transition-all">
                  Participant Demo
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white border-t border-stone-100">
        <div className="container-wide py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-stone-900 mb-4">How It Works</h2>
            <p className="text-stone-500 text-lg">From intervention to insights in four steps</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                step: '01',
                title: 'Define Intervention',
                description: 'Enter what you\'re studying. AI generates the complete protocol.',
                color: 'teal',
              },
              {
                step: '02',
                title: 'Enroll Participants',
                description: 'Share a link. Participants complete consent and screening on mobile.',
                color: 'emerald',
              },
              {
                step: '03',
                title: 'Collect Outcomes',
                description: 'Validated PRO instruments with automated reminders and safety monitoring.',
                color: 'violet',
              },
              {
                step: '04',
                title: 'Analyze Results',
                description: 'Real-world evidence from patient-reported outcomes and lab data.',
                color: 'amber',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative p-6 bg-stone-50 rounded-2xl border border-stone-100 hover:border-teal-200 hover:bg-white transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-2 w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-sm font-mono font-semibold text-stone-400">{item.step}</span>
                </div>

                <h3 className="font-semibold text-stone-900 mb-2 mt-2">{item.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section className="bg-stone-50 border-t border-stone-100">
        <div className="container-wide py-20 sm:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-stone-200 rounded-full text-xs font-medium text-stone-600 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              AI Agents
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-900 mb-4">
              Four Specialized Agents
            </h2>
            <p className="text-stone-500 text-lg max-w-xl mx-auto">
              Working together to design, launch, and run your study
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-900/5 transition-all duration-300">
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Protocol Agent</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Designs study endpoints, inclusion/exclusion criteria, PRO instruments, and safety thresholds.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-900/5 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Consent Agent</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Generates plain-language informed consent with comprehension verification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-900/5 transition-all duration-300">
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-violet-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Enrollment Agent</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Guides participants through registration, consent, and eligibility screening.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-900/5 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">Communication Agent</h3>
              <p className="text-sm text-stone-500 leading-relaxed">
                Sends personalized reminders and milestone messages to maximize retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Case Study */}
      <section className="relative overflow-hidden bg-stone-900">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/20 via-transparent to-amber-900/10" />

        <div className="relative container-wide py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-medium text-white/80 mb-6">
                Demo Case Study
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-6">
                TRT Outcomes Study
              </h2>
              <p className="text-stone-300 mb-8 leading-relaxed">
                A telehealth company wants to measure patient outcomes for testosterone
                replacement therapy. This demo shows how they can launch an observational
                study in minutes using our AI agents.
              </p>
              <ul className="space-y-4">
                {[
                  { icon: BarChart3, text: '26-week observational study' },
                  { icon: Clipboard, text: 'qADAM, IIEF-5, PHQ-2 instruments' },
                  { icon: Shield, text: 'Automated safety monitoring' },
                ].map((item) => (
                  <li key={item.text} className="flex items-center gap-3 text-stone-200">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-teal-400" />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/20 via-transparent to-amber-500/20 rounded-3xl blur-2xl" />

              <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <div className="space-y-4">
                  {[
                    { label: 'Primary Endpoint', value: 'qADAM Score at Week 12' },
                    { label: 'Population', value: 'Hypogonadal men initiating TRT' },
                    { label: 'Assessments', value: '9 timepoints, 4 PRO instruments' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white rounded-xl p-4">
                      <div className="text-xs text-stone-500 mb-1">{stat.label}</div>
                      <div className="font-semibold text-stone-900">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-xs text-stone-400 mb-2">Generated in</div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-display text-teal-400">~2 min</span>
                    <span className="text-stone-400">by AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="bg-white border-t border-stone-100">
        <div className="container-wide py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-stone-100 rounded-full text-xs font-medium text-stone-600 mb-6">
                Features
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-stone-900 mb-8">
                Everything You Need to Run a Study
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
                    <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mt-0.5">
                      <Check className="w-4 h-4 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-900">{feature.title}</h4>
                      <p className="text-sm text-stone-500 mt-1 leading-relaxed">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-teal-500/10 via-transparent to-violet-500/10 rounded-3xl blur-2xl" />
              <div className="relative bg-stone-50 rounded-2xl border border-stone-200 p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100">
                    <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                      <FileText className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-stone-200 rounded-full w-3/4 mb-2" />
                      <div className="h-2 bg-stone-100 rounded-full w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100">
                    <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-stone-200 rounded-full w-2/3 mb-2" />
                      <div className="h-2 bg-stone-100 rounded-full w-2/5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-stone-100">
                    <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-stone-200 rounded-full w-4/5 mb-2" />
                      <div className="h-2 bg-stone-100 rounded-full w-3/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-stone-50 border-t border-stone-100">
        <div className="container-wide py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-stone-900 mb-4">Ready to explore?</h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">
            See how AI can transform your clinical research workflow
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sponsor"
              className="btn btn-primary btn-lg group"
            >
              Create a Study
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/study"
              className="btn btn-secondary btn-lg"
            >
              Join a Study
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-100">
        <div className="container-wide py-8">
          <div className="text-center text-sm text-stone-400">
            Demo platform for observational clinical studies. Not for production use.
          </div>
        </div>
      </footer>
    </div>
  )
}
