import Link from 'next/link'
import { FileText, Users, BarChart3, Shield, Clipboard, Bell, ArrowRight, Sparkles, Zap, Check } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-slate-100">Study Platform</span>
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Demo Mode</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -left-40 top-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute right-1/4 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative container-wide py-20 sm:py-28">
          <div className="text-center max-w-3xl mx-auto stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm font-medium text-indigo-300">AI-Powered Clinical Research</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-slate-100 mb-6 text-balance">
              Observational Studies,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Simplified</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-12 max-w-2xl mx-auto text-balance leading-relaxed">
              Launch clinical observational studies in minutes with AI-powered protocol generation.
              Collect real-world patient outcomes with validated PRO instruments.
            </p>

            {/* Two Path Options */}
            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              {/* Sponsor Path */}
              <Link
                href="/sponsor"
                className="group bg-slate-800 p-7 rounded-2xl border border-slate-700 hover:border-indigo-500/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-indigo-500/10 text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600/20 to-indigo-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-indigo-500/20">
                  <FileText className="w-7 h-7 text-indigo-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-100 mb-2">Create a Study</h2>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  Design and launch an observational study with AI-generated protocols.
                </p>
                <span className="inline-flex items-center gap-1.5 text-indigo-400 font-medium text-sm group-hover:gap-2.5 transition-all">
                  Sponsor Demo
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* Participant Path */}
              <Link
                href="/study"
                className="group bg-slate-800 p-7 rounded-2xl border border-slate-700 hover:border-cyan-500/50 transition-all duration-300 shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-cyan-500/10 text-left"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-cyan-600/20 to-cyan-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform border border-cyan-500/20">
                  <Clipboard className="w-7 h-7 text-cyan-400" />
                </div>
                <h2 className="text-lg font-semibold text-slate-100 mb-2">Join a Study</h2>
                <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                  Experience the participant flow: consent, screening, and PRO surveys.
                </p>
                <span className="inline-flex items-center gap-1.5 text-cyan-400 font-medium text-sm group-hover:gap-2.5 transition-all">
                  Participant Demo
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-slate-800">
        <div className="container-wide py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-slate-100 mb-4">How It Works</h2>
            <p className="text-slate-400 text-lg">From intervention to insights in four steps</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {[
              {
                step: '01',
                title: 'Define Intervention',
                description: 'Enter what you\'re studying. AI generates the complete protocol.',
                color: 'indigo',
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
                color: 'cyan',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative p-6 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-indigo-500/30 hover:bg-slate-800 transition-all duration-300"
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-2 w-10 h-10 bg-slate-900 border border-slate-700 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm font-mono font-semibold text-slate-400">{item.step}</span>
                </div>

                <h3 className="font-semibold text-slate-100 mb-2 mt-2">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section className="bg-slate-800/30 border-t border-slate-800">
        <div className="container-wide py-20 sm:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              AI Agents
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-slate-100 mb-4">
              Four Specialized Agents
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Working together to design, launch, and run your study
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-indigo-500/40 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-4 border border-indigo-500/20">
                <FileText className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-slate-100 mb-2">Protocol Agent</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Designs study endpoints, inclusion/exclusion criteria, PRO instruments, and safety thresholds.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-4 border border-emerald-500/20">
                <Shield className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold text-slate-100 mb-2">Consent Agent</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generates plain-language informed consent with comprehension verification.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-violet-500/40 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300">
              <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4 border border-violet-500/20">
                <Users className="w-6 h-6 text-violet-400" />
              </div>
              <h3 className="font-semibold text-slate-100 mb-2">Enrollment Agent</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Guides participants through registration, consent, and eligibility screening.
              </p>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 hover:border-amber-500/40 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4 border border-amber-500/20">
                <Bell className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-semibold text-slate-100 mb-2">Engagement Agent</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Sends personalized reminders and milestone messages to maximize retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Case Study */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 border-t border-slate-800">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-cyan-500/5" />

        <div className="relative container-wide py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-medium text-indigo-300 mb-6">
                Demo Case Study
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-slate-100 mb-6">
                TRT Outcomes Study
              </h2>
              <p className="text-slate-400 mb-8 leading-relaxed">
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
                  <li key={item.text} className="flex items-center gap-3 text-slate-300">
                    <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                      <item.icon className="w-4 h-4 text-cyan-400" />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/20 via-transparent to-cyan-500/20 rounded-3xl blur-2xl" />

              <div className="relative bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
                <div className="space-y-4">
                  {[
                    { label: 'Primary Endpoint', value: 'qADAM Score at Week 12' },
                    { label: 'Population', value: 'Hypogonadal men initiating TRT' },
                    { label: 'Assessments', value: '9 timepoints, 4 PRO instruments' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-slate-900 rounded-xl p-4 border border-slate-700">
                      <div className="text-xs text-slate-500 mb-1">{stat.label}</div>
                      <div className="font-semibold text-slate-100">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-slate-700">
                  <div className="text-xs text-slate-500 mb-2">Generated in</div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-display text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">~2 min</span>
                    <span className="text-slate-500">by AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="border-t border-slate-800">
        <div className="container-wide py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-full text-xs font-medium text-slate-300 mb-6">
                Features
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-slate-100 mb-8">
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

            {/* Visual */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 rounded-3xl blur-2xl" />
              <div className="relative bg-slate-800 rounded-2xl border border-slate-700 p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-xl border border-slate-700">
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-lg flex items-center justify-center border border-indigo-500/20">
                      <FileText className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-slate-700 rounded-full w-3/4 mb-2" />
                      <div className="h-2 bg-slate-800 rounded-full w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-xl border border-slate-700">
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20">
                      <Shield className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-slate-700 rounded-full w-2/3 mb-2" />
                      <div className="h-2 bg-slate-800 rounded-full w-2/5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-900 rounded-xl border border-slate-700">
                    <div className="w-10 h-10 bg-violet-500/10 rounded-lg flex items-center justify-center border border-violet-500/20">
                      <Users className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-slate-700 rounded-full w-4/5 mb-2" />
                      <div className="h-2 bg-slate-800 rounded-full w-3/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-800/30 border-t border-slate-800">
        <div className="container-wide py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-slate-100 mb-4">Ready to explore?</h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
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
      <footer className="border-t border-slate-800">
        <div className="container-wide py-8">
          <div className="text-center text-sm text-slate-500">
            Demo platform for observational clinical studies. Not for production use.
          </div>
        </div>
      </footer>
    </div>
  )
}
