import Link from 'next/link'
import { FileText, Users, BarChart3, Shield, Clipboard, Bell } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SP</span>
              </div>
              <span className="font-semibold text-gray-900">Study Platform</span>
            </div>
            <div className="text-sm text-gray-500">Demo Mode</div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Observational Studies,{' '}
              <span className="text-indigo-600">Simplified</span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Launch clinical observational studies in minutes with AI-powered protocol generation.
              Collect real-world patient outcomes with validated PRO instruments.
            </p>
          </div>

          {/* Two Path Options */}
          <div className="mt-12 grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Sponsor Path */}
            <Link
              href="/sponsor"
              className="group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-indigo-600 transition-all shadow-sm hover:shadow-md"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <FileText className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Create a Study</h2>
              <p className="text-gray-600 mb-4">
                Design and launch an observational study with AI-generated protocols.
              </p>
              <span className="text-indigo-600 font-medium group-hover:underline">
                Sponsor Demo →
              </span>
            </Link>

            {/* Participant Path */}
            <Link
              href="/study"
              className="group bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-indigo-600 transition-all shadow-sm hover:shadow-md"
            >
              <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors">
                <Clipboard className="w-7 h-7 text-indigo-600 group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Join a Study</h2>
              <p className="text-gray-600 mb-4">
                Experience the participant flow: consent, screening, and PRO surveys.
              </p>
              <span className="text-indigo-600 font-medium group-hover:underline">
                Participant Demo →
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-4 text-gray-600">From intervention to insights in four steps</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Define Intervention</h3>
              <p className="text-sm text-gray-600">
                Enter what you&apos;re studying. AI generates the complete protocol.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enroll Participants</h3>
              <p className="text-sm text-gray-600">
                Share a link. Participants complete consent and screening on mobile.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Collect Outcomes</h3>
              <p className="text-sm text-gray-600">
                Validated PRO instruments with automated reminders and safety monitoring.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-indigo-600 font-bold">4</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Analyze Results</h3>
              <p className="text-sm text-gray-600">
                Real-world evidence from patient-reported outcomes and lab data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              AI-Powered Study Platform
            </h2>
            <p className="mt-4 text-gray-600">
              Four specialized agents work together to run your study
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Protocol Agent</h3>
              <p className="text-sm text-gray-600">
                Designs study endpoints, inclusion/exclusion criteria, PRO instruments, and safety thresholds.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Consent Agent</h3>
              <p className="text-sm text-gray-600">
                Generates plain-language informed consent with comprehension verification.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Enrollment Agent</h3>
              <p className="text-sm text-gray-600">
                Guides participants through registration, consent, and eligibility screening.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Bell className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Communication Agent</h3>
              <p className="text-sm text-gray-600">
                Sends personalized reminders and milestone messages to maximize retention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Case */}
      <section className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="text-indigo-200 font-medium mb-2">DEMO CASE STUDY</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                TRT Outcomes Study
              </h2>
              <p className="text-indigo-100 mb-6">
                A telehealth company wants to measure patient outcomes for testosterone
                replacement therapy. This demo shows how they can launch an observational
                study in minutes using our AI agents.
              </p>
              <ul className="space-y-3 text-indigo-100">
                <li className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>26-week observational study</span>
                </li>
                <li className="flex items-center gap-2">
                  <Clipboard className="w-5 h-5" />
                  <span>qADAM, IIEF-5, PHQ-2 instruments</span>
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Automated safety monitoring</span>
                </li>
              </ul>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-8">
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Primary Endpoint</div>
                  <div className="font-semibold text-gray-900">qADAM Score at Week 12</div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Population</div>
                  <div className="font-semibold text-gray-900">
                    Hypogonadal men initiating TRT
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4">
                  <div className="text-sm text-gray-500 mb-1">Assessments</div>
                  <div className="font-semibold text-gray-900">
                    9 timepoints, 4 PRO instruments
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ready to explore?</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/sponsor"
              className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Create a Study
            </Link>
            <Link
              href="/study"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Join a Study
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-500">
            Demo platform for observational clinical studies. Not for production use.
          </div>
        </div>
      </footer>
    </div>
  )
}
