'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

interface InterventionOption {
  name: string
  category: 'pharmacological' | 'behavioral' | 'device' | 'lifestyle' | 'supplement'
}

const INTERVENTIONS: InterventionOption[] = [
  // Pharmacological - Hormone Therapies
  { name: 'Testosterone replacement therapy (TRT)', category: 'pharmacological' },
  { name: 'Estrogen replacement therapy', category: 'pharmacological' },
  { name: 'Growth hormone therapy', category: 'pharmacological' },
  { name: 'Thyroid hormone replacement', category: 'pharmacological' },
  { name: 'DHEA supplementation', category: 'pharmacological' },

  // Pharmacological - Weight Management
  { name: 'GLP-1 agonists (semaglutide, tirzepatide)', category: 'pharmacological' },
  { name: 'Phentermine', category: 'pharmacological' },
  { name: 'Metformin for weight loss', category: 'pharmacological' },
  { name: 'Orlistat', category: 'pharmacological' },

  // Pharmacological - Mental Health
  { name: 'Ketamine therapy', category: 'pharmacological' },
  { name: 'Psilocybin-assisted therapy', category: 'pharmacological' },
  { name: 'MDMA-assisted therapy', category: 'pharmacological' },
  { name: 'SSRIs for depression', category: 'pharmacological' },
  { name: 'Bupropion', category: 'pharmacological' },
  { name: 'Esketamine (Spravato)', category: 'pharmacological' },

  // Pharmacological - Performance/Peptides
  { name: 'BPC-157', category: 'pharmacological' },
  { name: 'TB-500', category: 'pharmacological' },
  { name: 'PT-141 (Bremelanotide)', category: 'pharmacological' },
  { name: 'Ipamorelin', category: 'pharmacological' },
  { name: 'CJC-1295', category: 'pharmacological' },
  { name: 'NAD+ infusions', category: 'pharmacological' },

  // Pharmacological - Sexual Health
  { name: 'Sildenafil (Viagra)', category: 'pharmacological' },
  { name: 'Tadalafil (Cialis)', category: 'pharmacological' },
  { name: 'Clomiphene citrate', category: 'pharmacological' },

  // Pharmacological - Hair Loss
  { name: 'Finasteride for hair loss', category: 'pharmacological' },
  { name: 'Minoxidil', category: 'pharmacological' },
  { name: 'Dutasteride', category: 'pharmacological' },

  // Pharmacological - Other
  { name: 'Low-dose naltrexone (LDN)', category: 'pharmacological' },
  { name: 'Rapamycin for longevity', category: 'pharmacological' },
  { name: 'Modafinil', category: 'pharmacological' },

  // Behavioral - Therapy
  { name: 'Cognitive behavioral therapy (CBT)', category: 'behavioral' },
  { name: 'Virtual CBT', category: 'behavioral' },
  { name: 'Dialectical behavior therapy (DBT)', category: 'behavioral' },
  { name: 'Acceptance and commitment therapy (ACT)', category: 'behavioral' },
  { name: 'Exposure therapy', category: 'behavioral' },
  { name: 'EMDR therapy', category: 'behavioral' },
  { name: 'Group therapy', category: 'behavioral' },

  // Behavioral - Coaching
  { name: 'Health coaching', category: 'behavioral' },
  { name: 'Sleep coaching', category: 'behavioral' },
  { name: 'Nutrition coaching', category: 'behavioral' },
  { name: 'Stress management coaching', category: 'behavioral' },

  // Behavioral - Digital
  { name: 'Digital therapeutics for anxiety', category: 'behavioral' },
  { name: 'Mobile app for depression', category: 'behavioral' },
  { name: 'Guided meditation app', category: 'behavioral' },
  { name: 'Biofeedback training', category: 'behavioral' },

  // Lifestyle - Diet
  { name: 'Intermittent fasting', category: 'lifestyle' },
  { name: 'Ketogenic diet', category: 'lifestyle' },
  { name: 'Mediterranean diet', category: 'lifestyle' },
  { name: 'Time-restricted eating', category: 'lifestyle' },
  { name: 'Plant-based diet', category: 'lifestyle' },
  { name: 'Elimination diet', category: 'lifestyle' },

  // Lifestyle - Exercise
  { name: 'High-intensity interval training (HIIT)', category: 'lifestyle' },
  { name: 'Resistance training program', category: 'lifestyle' },
  { name: 'Yoga program', category: 'lifestyle' },
  { name: 'Walking program', category: 'lifestyle' },
  { name: 'Zone 2 cardio training', category: 'lifestyle' },

  // Lifestyle - Sleep
  { name: 'Sleep hygiene intervention', category: 'lifestyle' },
  { name: 'Sleep restriction therapy', category: 'lifestyle' },
  { name: 'Blue light blocking', category: 'lifestyle' },

  // Lifestyle - Other
  { name: 'Cold exposure/cold plunge', category: 'lifestyle' },
  { name: 'Sauna therapy', category: 'lifestyle' },
  { name: 'Breathwork program', category: 'lifestyle' },
  { name: 'Red light therapy', category: 'lifestyle' },
  { name: 'Grounding/earthing', category: 'lifestyle' },

  // Devices
  { name: 'Continuous glucose monitor (CGM)', category: 'device' },
  { name: 'CPAP therapy', category: 'device' },
  { name: 'Wearable activity tracker', category: 'device' },
  { name: 'Transcranial direct current stimulation (tDCS)', category: 'device' },
  { name: 'Transcranial magnetic stimulation (TMS)', category: 'device' },
  { name: 'Vagus nerve stimulation', category: 'device' },
  { name: 'TENS unit for pain', category: 'device' },
  { name: 'Oura ring for sleep tracking', category: 'device' },

  // Supplements
  { name: 'Vitamin D supplementation', category: 'supplement' },
  { name: 'Omega-3 fish oil', category: 'supplement' },
  { name: 'Magnesium supplementation', category: 'supplement' },
  { name: 'Creatine monohydrate', category: 'supplement' },
  { name: 'Ashwagandha', category: 'supplement' },
  { name: 'Lion\'s mane mushroom', category: 'supplement' },
  { name: 'Berberine', category: 'supplement' },
  { name: 'CoQ10', category: 'supplement' },
  { name: 'Probiotics', category: 'supplement' },
  { name: 'Collagen peptides', category: 'supplement' },
]

export default function CreateStudyPage() {
  const router = useRouter()
  const [intervention, setIntervention] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Filter interventions based on input - limit to top 8 matches
  const filteredSuggestions = intervention.trim().length > 0
    ? INTERVENTIONS
        .filter(item => item.name.toLowerCase().includes(intervention.toLowerCase()))
        .slice(0, 8)
    : []

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectSuggestion = (name: string) => {
    setIntervention(name)
    setShowSuggestions(false)
    setHighlightedIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || filteredSuggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
        break
      case 'Enter':
        if (highlightedIndex >= 0 && filteredSuggestions[highlightedIndex]) {
          e.preventDefault()
          handleSelectSuggestion(filteredSuggestions[highlightedIndex].name)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setHighlightedIndex(-1)
        break
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!intervention.trim()) return

    setIsSubmitting(true)
    setError('')

    try {
      // Call study discovery API
      console.log('[StudyDiscovery] Sending request for intervention:', intervention.trim())
      const response = await fetch('/api/agents/study-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervention: intervention.trim() }),
      })

      const data = await response.json()
      console.log('[StudyDiscovery] Response status:', response.status)

      if (!response.ok) {
        console.error('[StudyDiscovery] Error response:', data)
        setError(data.error || 'Failed to analyze intervention')
        setIsSubmitting(false)
        return
      }

      // Store discovery results in sessionStorage for the configure page
      sessionStorage.setItem('studyDiscovery', JSON.stringify(data.data))

      // Navigate to configure page
      const params = new URLSearchParams({ intervention: intervention.trim() })
      router.push(`/sponsor/create/configure?${params.toString()}`)

    } catch (err) {
      console.error('Study discovery error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Decorative elements */}
      <div className="fixed -right-40 top-20 w-96 h-96 bg-[#3B82F6]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -left-40 bottom-20 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative container-base py-8 sm:py-12">
        {/* Back link */}
        <Link
          href="/sponsor"
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-[#3B82F6]" />
            <span className="text-xs font-medium text-[#3B82F6]">New Study</span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl text-slate-900 mb-3">
            What do you want to study?
          </h1>
          <p className="text-slate-600 max-w-md mx-auto">
            Describe the treatment or intervention, and our AI will design a complete study protocol.
          </p>
        </div>

        {/* Form Card */}
        <Card variant="elevated" padding="lg" className="max-w-xl mx-auto animate-fade-in-up">
          <form onSubmit={handleSubmit}>
            {/* Autocomplete Input */}
            <div className="mb-6 relative">
              <Textarea
                ref={inputRef}
                value={intervention}
                onChange={(e) => {
                  setIntervention(e.target.value)
                  setShowSuggestions(e.target.value.trim().length > 0)
                  setHighlightedIndex(-1)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Start typing to search interventions..."
                className="text-lg min-h-[100px]"
                autoFocus
              />

              {/* Autocomplete Dropdown - only show when typing */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div
                  ref={suggestionsRef}
                  className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden"
                >
                  {filteredSuggestions.map((item, index) => {
                    const isHighlighted = index === highlightedIndex

                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => handleSelectSuggestion(item.name)}
                        className={`
                          w-full text-left px-4 py-3 text-sm transition-colors border-b border-slate-100 last:border-b-0
                          ${isHighlighted
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-slate-700 hover:bg-slate-50'
                          }
                        `}
                      >
                        {item.name}
                      </button>
                    )
                  })}
                </div>
              )}

              {/* No results message */}
              {showSuggestions && intervention.trim().length > 0 && filteredSuggestions.length === 0 && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-xl p-4">
                  <p className="text-sm text-slate-500 text-center">
                    No matching interventions found. You can still continue with your custom input.
                  </p>
                </div>
              )}
            </div>

            {/* Quick picks */}
            <div className="mb-6">
              <div className="text-sm text-slate-600 mb-3">Popular choices:</div>
              <div className="flex flex-wrap gap-2">
                {['GLP-1 agonists (semaglutide, tirzepatide)', 'Testosterone replacement therapy (TRT)', 'Ketamine therapy', 'Intermittent fasting', 'Virtual CBT'].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => handleSelectSuggestion(example)}
                    className={`
                      px-3 py-1.5 text-sm rounded-full border transition-all duration-150
                      ${intervention === example
                        ? 'bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                      }
                    `}
                  >
                    {example.length > 30 ? example.slice(0, 30) + '...' : example}
                  </button>
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              size="lg"
              fullWidth
              disabled={!intervention.trim()}
              isLoading={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Intervention...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Info */}
        <p className="mt-8 text-center text-sm text-slate-500 max-w-md mx-auto animate-fade-in">
          Our AI will analyze your intervention and generate a complete study protocol
          including endpoints, PRO instruments, and safety monitoring.
        </p>
      </div>
    </div>
  )
}
