import Link from 'next/link'
import { FileText, Users, BarChart3, Shield, Clipboard, Bell, ArrowRight, Sparkles, Check, ShieldAlert, ClipboardList } from 'lucide-react'
import { ProoveLogo } from '@/components/ui/ProoveLogo'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
        <div className="container-wide">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2.5">
              <ProoveLogo size={36} className="shadow-md rounded-full" />
              <span className="font-semibold text-slate-900">Proove Platform</span>
            </div>
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Demo Mode</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-slate-50">
        {/* Decorative elements */}
        <div className="absolute -right-40 -top-40 w-96 h-96 bg-[#3B82F6]/5 rounded-full blur-3xl" />
        <div className="absolute -left-40 top-1/2 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        <div className="absolute right-1/4 bottom-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl" />

        <div className="relative container-wide pt-12 sm:pt-16 pb-20 sm:pb-28">
          <div className="text-center max-w-3xl mx-auto stagger-children">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#3B82F6]/5 border border-[#3B82F6]/10 rounded-full mb-12">
              <Sparkles className="w-4 h-4 text-[#3B82F6]" />
              <span className="text-sm font-medium text-[#3B82F6]">AI-Powered Clinical Research</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-slate-900 mb-6 text-balance leading-tight tracking-tight">
              Proove{' '}
              <span className="relative inline-block">
                {/* "Everything" - burnt orange, bold, above "Something" */}
                <span
                  className="absolute -top-[0.9em] left-0
                             text-[#C2410C]
                             text-[0.97em] font-bold tracking-tight
                             animate-fade-in-up opacity-0"
                  style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}
                >
                  Everything
                </span>
                {/* "Something" - muted, lighter weight, with burnt orange hand-drawn strikethrough */}
                <span className="relative text-slate-400 font-normal">
                  Something
                  {/* Hand-drawn burnt orange strikethrough - primary line */}
                  <svg
                    className="absolute -left-[5%] top-[40%] w-[110%] h-[50%] overflow-visible animate-strike"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M 0 12 Q 20 8, 40 12 Q 60 16, 80 10 Q 95 6, 100 10"
                      fill="none"
                      stroke="#C2410C"
                      strokeWidth="3"
                      strokeLinecap="round"
                      className="origin-left"
                      style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'draw-strike 0.6s ease-out 0.1s forwards' }}
                    />
                    {/* Secondary thinner line for hand-drawn effect */}
                    <path
                      d="M 5 15 Q 30 12, 50 15 Q 75 18, 95 13"
                      fill="none"
                      stroke="#C2410C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.4"
                      style={{ strokeDasharray: 200, strokeDashoffset: 200, animation: 'draw-strike 0.5s ease-out 0.2s forwards' }}
                    />
                  </svg>
                </span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 mb-12 max-w-2xl mx-auto text-balance leading-relaxed">
              Launch clinical observational studies in minutes with AI-powered protocol generation.
              Collect real-world patient outcomes with validated PRO instruments.
            </p>

            {/* Two Path Options */}
            <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
              {/* Sponsor Path */}
              <Link
                href="/sponsor"
                className="group bg-white p-7 rounded-2xl border border-slate-200 hover:border-[#6D28D9]/30 transition-all duration-300 shadow-sm hover:shadow-lg text-left"
              >
                <div className="w-14 h-14 bg-[#6D28D9] rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-md">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Create a Study</h2>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Design and launch an observational study with AI-generated protocols.
                </p>
                <span className="inline-flex items-center gap-1.5 text-[#6D28D9] font-medium text-sm group-hover:gap-2.5 transition-all">
                  Sponsor Demo
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>

              {/* Participant Path */}
              <Link
                href="/study"
                className="group bg-white p-7 rounded-2xl border border-slate-200 hover:border-[#C2410C]/30 transition-all duration-300 shadow-sm hover:shadow-lg text-left"
              >
                <div className="w-14 h-14 bg-[#C2410C] rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-md">
                  <Clipboard className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">Join a Study</h2>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                  Experience the participant flow: consent, screening, and PRO surveys.
                </p>
                <span className="inline-flex items-center gap-1.5 text-[#C2410C] font-medium text-sm group-hover:gap-2.5 transition-all">
                  Participant Demo
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-slate-200 bg-white">
        <div className="container-wide py-20 sm:py-24">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-4">How It Works</h2>
            <p className="text-slate-600 text-lg">From intervention to insights in five steps</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5 lg:gap-6">
            {[
              {
                step: '01',
                title: 'Define Intervention',
                description: 'Enter what you\'re studying. AI analyzes the clinical context.',
                icon: Sparkles,
                iconBg: 'bg-[#3B82F6]',
                iconColor: 'text-white',
                stepColor: 'text-[#3B82F6]',
                hoverBorder: 'hover:border-[#3B82F6]/40',
              },
              {
                step: '02',
                title: 'Design Protocol',
                description: 'AI generates endpoints, PRO instruments, consent, and safety rules.',
                icon: ClipboardList,
                iconBg: 'bg-[#0891B2]',
                iconColor: 'text-white',
                stepColor: 'text-[#0891B2]',
                hoverBorder: 'hover:border-[#0891B2]/40',
              },
              {
                step: '03',
                title: 'Enroll Participants',
                description: 'Share a link. Participants consent and screen on mobile.',
                icon: Users,
                iconBg: 'bg-[#6D28D9]',
                iconColor: 'text-white',
                stepColor: 'text-[#6D28D9]',
                hoverBorder: 'hover:border-[#6D28D9]/40',
              },
              {
                step: '04',
                title: 'Collect Outcomes',
                description: 'Validated PROs with automated reminders and safety monitoring.',
                icon: Clipboard,
                iconBg: 'bg-[#C2410C]',
                iconColor: 'text-white',
                stepColor: 'text-[#C2410C]',
                hoverBorder: 'hover:border-[#C2410C]/40',
              },
              {
                step: '05',
                title: 'Analyze Results',
                description: 'Real-world evidence from patient outcomes and lab data.',
                icon: BarChart3,
                iconBg: 'bg-[#0D9488]',
                iconColor: 'text-white',
                stepColor: 'text-[#0D9488]',
                hoverBorder: 'hover:border-[#0D9488]/40',
              },
            ].map((item) => (
              <div
                key={item.step}
                className={`group relative p-6 bg-white rounded-2xl border border-slate-200 ${item.hoverBorder} hover:shadow-lg transition-all duration-300`}
              >
                {/* Step number */}
                <div className="absolute -top-3 -right-2 w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                  <span className={`text-sm font-mono font-bold ${item.stepColor}`}>{item.step}</span>
                </div>

                {/* Icon */}
                <div className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                  <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                </div>

                <h3 className="font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Agents */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="container-wide py-20 sm:py-24">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-700 mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#3B82F6]" />
              AI Agents
            </div>
            <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-4">
              Five Specialized Agents
            </h2>
            <p className="text-slate-600 text-lg max-w-xl mx-auto">
              Working together to design, launch, and run your study
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#3B82F6]/40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#3B82F6] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Protocol Agent</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Designs study endpoints, inclusion/exclusion criteria, and PRO instruments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#DC2626]/40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#DC2626] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <ShieldAlert className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Safety Agent</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Creates intervention-specific safety rules, alert thresholds, and monitoring protocols.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#15803D]/40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#15803D] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Consent Agent</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generates plain-language informed consent with comprehension verification.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#6D28D9]/40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#6D28D9] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Enrollment Agent</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Guides participants through registration, consent, and eligibility screening.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-[#C2410C]/40 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-[#C2410C] rounded-xl flex items-center justify-center mb-4 shadow-md">
                <Bell className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">Engagement Agent</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Sends personalized reminders and milestone messages to maximize retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Case Study */}
      <section className="relative overflow-hidden bg-[#3B82F6] border-t border-slate-200">

        <div className="relative container-wide py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 rounded-full text-xs font-medium text-white/90 mb-6">
                Demo Case Study
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-white mb-6">
                TRT Outcomes Study
              </h2>
              <p className="text-white/70 mb-8 leading-relaxed">
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
                  <li key={item.text} className="flex items-center gap-3 text-white/90">
                    <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                      <item.icon className="w-4 h-4 text-orange-500" />
                    </div>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-8">
                <div className="space-y-4">
                  {[
                    { label: 'Primary Endpoint', value: 'qADAM Score at Week 12' },
                    { label: 'Population', value: 'Hypogonadal men initiating TRT' },
                    { label: 'Assessments', value: '9 timepoints, 4 PRO instruments' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="text-xs text-white/50 mb-1">{stat.label}</div>
                      <div className="font-semibold text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-xs text-white/50 mb-2">Generated in</div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-display text-[#C2410C]">~2 min</span>
                    <span className="text-white/50">by AI</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="border-t border-slate-200 bg-white">
        <div className="container-wide py-20 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700 mb-6">
                Features
              </div>
              <h2 className="font-display text-3xl sm:text-4xl text-slate-900 mb-8">
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
                    <div className="flex-shrink-0 w-6 h-6 bg-[#15803D] rounded-full flex items-center justify-center mt-0.5 shadow-sm">
                      <Check className="w-4 h-4 text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{feature.title}</h4>
                      <p className="text-sm text-slate-600 mt-1 leading-relaxed">{feature.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Visual */}
            <div className="relative">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-[#3B82F6] rounded-lg flex items-center justify-center shadow-sm">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-slate-200 rounded-full w-3/4 mb-2" />
                      <div className="h-2 bg-slate-100 rounded-full w-1/2" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-[#15803D] rounded-lg flex items-center justify-center shadow-sm">
                      <Shield className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-slate-200 rounded-full w-2/3 mb-2" />
                      <div className="h-2 bg-slate-100 rounded-full w-2/5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200">
                    <div className="w-10 h-10 bg-[#6D28D9] rounded-lg flex items-center justify-center shadow-sm">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2.5 bg-slate-200 rounded-full w-4/5 mb-2" />
                      <div className="h-2 bg-slate-100 rounded-full w-3/5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-50 border-t border-slate-200">
        <div className="container-wide py-16 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-slate-900 mb-4">Ready to explore?</h2>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
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
      <footer className="border-t border-slate-200 bg-white">
        <div className="container-wide py-8">
          <div className="text-center text-sm text-slate-500">
            Demo platform for observational clinical studies. Not for production use.
          </div>
        </div>
      </footer>
    </div>
  )
}
