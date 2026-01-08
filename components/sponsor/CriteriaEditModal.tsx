'use client'

import { useState } from 'react'
import { X, Pencil, Trash2, Plus, Sparkles, Loader2, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Criterion {
  criterion: string
  rationale: string
  assessmentMethod: string
}

interface CriteriaEditModalProps {
  type: 'inclusion' | 'exclusion'
  criteria: Criterion[]
  intervention: string
  onSave: (criteria: Criterion[]) => void
  onClose: () => void
}

export function CriteriaEditModal({
  type,
  criteria: initialCriteria,
  intervention,
  onSave,
  onClose,
}: CriteriaEditModalProps) {
  const [criteria, setCriteria] = useState<Criterion[]>(initialCriteria)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [suggestions, setSuggestions] = useState<Criterion[]>([])
  const [error, setError] = useState('')

  // Form state for editing/adding
  const [formDescription, setFormDescription] = useState('')
  const [formRationale, setFormRationale] = useState('')
  const [formAssessment, setFormAssessment] = useState('')
  const [isExpanding, setIsExpanding] = useState(false)

  const isEditing = editingIndex !== null || isAddingNew

  const startEdit = (index: number) => {
    const criterion = criteria[index]
    setFormDescription(criterion.criterion)
    setFormRationale(criterion.rationale)
    setFormAssessment(criterion.assessmentMethod)
    setEditingIndex(index)
    setIsAddingNew(false)
    setSuggestions([])
  }

  const startAdd = () => {
    setFormDescription('')
    setFormRationale('')
    setFormAssessment('')
    setEditingIndex(null)
    setIsAddingNew(true)
    setSuggestions([])
  }

  const cancelEdit = () => {
    setFormDescription('')
    setFormRationale('')
    setFormAssessment('')
    setEditingIndex(null)
    setIsAddingNew(false)
  }

  const handleDelete = (index: number) => {
    setCriteria(criteria.filter((_, i) => i !== index))
  }

  const handleExpand = async () => {
    if (!formDescription.trim()) return

    setIsExpanding(true)
    setError('')

    try {
      const response = await fetch('/api/agents/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'expand',
          intervention,
          type,
          description: formDescription,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate details')
        return
      }

      setFormDescription(data.criterion)
      setFormRationale(data.rationale)
      setFormAssessment(data.assessmentMethod)
    } catch (err) {
      console.error('Expand error:', err)
      setError('Failed to generate details. Please try again.')
    } finally {
      setIsExpanding(false)
    }
  }

  const handleSaveEdit = () => {
    if (!formDescription.trim()) return

    const newCriterion: Criterion = {
      criterion: formDescription.trim(),
      rationale: formRationale.trim(),
      assessmentMethod: formAssessment.trim(),
    }

    if (editingIndex !== null) {
      const updated = [...criteria]
      updated[editingIndex] = newCriterion
      setCriteria(updated)
    } else if (isAddingNew) {
      setCriteria([...criteria, newCriterion])
    }

    cancelEdit()
  }

  const handleSuggestMore = async () => {
    setIsSuggesting(true)
    setError('')
    setSuggestions([])

    try {
      const response = await fetch('/api/agents/criteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'suggest',
          intervention,
          type,
          existingCriteria: criteria,
          count: 3,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to generate suggestions')
        return
      }

      setSuggestions(data.suggestions || [])
    } catch (err) {
      console.error('Suggest error:', err)
      setError('Failed to generate suggestions. Please try again.')
    } finally {
      setIsSuggesting(false)
    }
  }

  const acceptSuggestion = (suggestion: Criterion) => {
    setCriteria([...criteria, suggestion])
    setSuggestions(suggestions.filter(s => s !== suggestion))
  }

  const dismissSuggestion = (suggestion: Criterion) => {
    setSuggestions(suggestions.filter(s => s !== suggestion))
  }

  const handleSaveAll = () => {
    onSave(criteria)
    onClose()
  }

  const typeColors = type === 'inclusion'
    ? { bg: 'bg-emerald-50', border: 'border-emerald-200', bullet: 'text-emerald-600' }
    : { bg: 'bg-red-50', border: 'border-red-200', bullet: 'text-red-600' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">
            Edit {type === 'inclusion' ? 'Inclusion' : 'Exclusion'} Criteria
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Edit/Add Form */}
          {isEditing && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Describe the criterion
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={type === 'inclusion'
                    ? 'e.g., Adults over 50 with vitamin D deficiency'
                    : 'e.g., History of kidney stones'
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none"
                  rows={2}
                />
                <button
                  onClick={handleExpand}
                  disabled={!formDescription.trim() || isExpanding}
                  className="mt-2 flex items-center gap-2 text-sm text-[#1E40AF] hover:text-[#1E40AF]/80 disabled:text-slate-400 disabled:cursor-not-allowed"
                >
                  {isExpanding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Generate Details
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rationale
                </label>
                <textarea
                  value={formRationale}
                  onChange={(e) => setFormRationale(e.target.value)}
                  placeholder="Clinical justification for this criterion..."
                  className="w-full p-3 border border-slate-200 rounded-xl resize-none focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none text-sm"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Assessment Method
                </label>
                <input
                  type="text"
                  value={formAssessment}
                  onChange={(e) => setFormAssessment(e.target.value)}
                  placeholder="e.g., Self-reported, Lab confirmation, Medical history review"
                  className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#1E40AF] focus:border-[#1E40AF] outline-none text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="secondary" size="sm" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!formDescription.trim()}
                >
                  {editingIndex !== null ? 'Update' : 'Add'}
                </Button>
              </div>
            </div>
          )}

          {/* Criteria List */}
          {!isEditing && (
            <div className="space-y-3">
              {criteria.map((criterion, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-xl border ${typeColors.bg} ${typeColors.border}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2">
                        <span className={`${typeColors.bullet} mt-0.5`}>•</span>
                        <span className="font-medium text-slate-900">
                          {criterion.criterion}
                        </span>
                      </div>
                      {criterion.rationale && (
                        <p className="text-sm text-slate-600 mt-1 ml-4">
                          {criterion.rationale}
                        </p>
                      )}
                      {criterion.assessmentMethod && (
                        <p className="text-xs text-slate-500 mt-1 ml-4">
                          Assessment: {criterion.assessmentMethod}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => startEdit(index)}
                        className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4 text-slate-500" />
                      </button>
                      <button
                        onClick={() => handleDelete(index)}
                        className="p-1.5 rounded-lg hover:bg-white/60 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {criteria.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  No criteria yet. Add one below.
                </div>
              )}

              {/* Add New Button */}
              <button
                onClick={startAdd}
                className="w-full p-3 border-2 border-dashed border-slate-300 rounded-xl text-slate-600 hover:border-[#1E40AF] hover:text-[#1E40AF] transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Criterion
              </button>
            </div>
          )}

          {/* AI Suggestions */}
          {suggestions.length > 0 && !isEditing && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#1E40AF]" />
                AI Suggestions
              </h3>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-[#1E40AF]/30 bg-[#1E40AF]/5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-slate-900">
                        {suggestion.criterion}
                      </span>
                      {suggestion.rationale && (
                        <p className="text-sm text-slate-600 mt-1">
                          {suggestion.rationale}
                        </p>
                      )}
                      {suggestion.assessmentMethod && (
                        <p className="text-xs text-slate-500 mt-1">
                          Assessment: {suggestion.assessmentMethod}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => acceptSuggestion(suggestion)}
                        className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 transition-colors"
                        title="Accept"
                      >
                        <Check className="w-4 h-4 text-emerald-600" />
                      </button>
                      <button
                        onClick={() => dismissSuggestion(suggestion)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={handleSuggestMore}
            disabled={isSuggesting || isEditing}
            className="flex items-center gap-2 px-4 py-2 text-sm text-[#1E40AF] hover:bg-[#1E40AF]/10 rounded-lg transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
          >
            {isSuggesting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            Suggest More
          </button>

          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveAll} disabled={isEditing}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
