import Link from 'next/link'
import { FileText, Users, BarChart3, Shield } from 'lucide-react'

export default function SponsorPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight">
              Create Observational Studies with AI
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Launch clinical observational studies in minutes. Our AI agents generate
              complete study protocols, informed consent documents, and patient communications
              tailored to your intervention.
            </p>
            <div className="mt-10">
              <Link
                href="/sponsor/create"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Create a Study
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              How It Works
            </h2>
            <p className="mt-4 text-gray-600">
              From intervention to live study in four simple steps
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-sm font-medium text-indigo-600 mb-2">Step 1</div>
              <h3 className="font-semibold text-gray-900 mb-2">Define Your Intervention</h3>
              <p className="text-sm text-gray-600">
                Enter the treatment or intervention you want to study. Our AI handles the rest.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-sm font-medium text-indigo-600 mb-2">Step 2</div>
              <h3 className="font-semibold text-gray-900 mb-2">AI Generates Protocol</h3>
              <p className="text-sm text-gray-600">
                Our Clinical Protocol Agent designs endpoints, PRO instruments, and safety thresholds.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-sm font-medium text-indigo-600 mb-2">Step 3</div>
              <h3 className="font-semibold text-gray-900 mb-2">Invite Participants</h3>
              <p className="text-sm text-gray-600">
                Participants complete consent, screening, and baseline surveys on their mobile devices.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="text-sm font-medium text-indigo-600 mb-2">Step 4</div>
              <h3 className="font-semibold text-gray-900 mb-2">Collect Real-World Data</h3>
              <p className="text-sm text-gray-600">
                Track outcomes with validated PRO instruments and integrate lab results automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">
                AI-Powered Study Design
              </h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Validated PRO Instruments</span>
                    <p className="text-sm text-gray-600 mt-1">
                      qADAM, IIEF-5, PHQ-2, and other validated questionnaires selected for your intervention.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Auto-Generated Consent</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Plain-language informed consent documents with comprehension verification.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Safety Monitoring</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Automatic alerts when participants exceed safety thresholds on PROs or labs.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Smart Engagement</span>
                    <p className="text-sm text-gray-600 mt-1">
                      AI-crafted reminders and milestone messages to maximize participant retention.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="bg-gray-100 rounded-xl p-8 lg:p-12">
              <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
                <div className="text-sm text-gray-500 mb-2">Example Study</div>
                <div className="font-semibold text-gray-900 text-lg mb-4">
                  TRT Outcomes Study
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration</span>
                    <span className="font-medium text-gray-900">26 weeks</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Primary Endpoint</span>
                    <span className="font-medium text-gray-900">qADAM Score</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">PRO Instruments</span>
                    <span className="font-medium text-gray-900">4 validated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lab Markers</span>
                    <span className="font-medium text-gray-900">3 tracked</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-indigo-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ready to launch your study?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Get started in minutes. No protocol writing experience required.
          </p>
          <Link
            href="/sponsor/create"
            className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 font-medium rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Create Your First Study
          </Link>
        </div>
      </section>
    </div>
  )
}
