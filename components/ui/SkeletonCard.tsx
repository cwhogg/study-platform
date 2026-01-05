interface SkeletonProps {
  className?: string
}

/**
 * Basic skeleton line for text placeholders.
 */
export function Skeleton({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      aria-hidden="true"
    />
  )
}

/**
 * Skeleton card for loading states.
 * Use when loading cards with title, description, and metadata.
 */
export function SkeletonCard({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
      aria-busy="true"
      aria-label="Loading"
    >
      <Skeleton className="h-5 w-1/3 mb-4" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}

/**
 * Skeleton for study protocol cards during generation.
 */
export function SkeletonProtocolCard({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-6 ${className}`}
      aria-busy="true"
      aria-label="Generating protocol"
    >
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-5 w-32" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}

/**
 * Skeleton for list items (used in study/participant lists).
 */
export function SkeletonListItem({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 ${className}`}
      aria-busy="true"
    >
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="flex-1">
        <Skeleton className="h-4 w-1/3 mb-2" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <Skeleton className="h-8 w-20 rounded-lg" />
    </div>
  )
}

/**
 * Skeleton for PRO survey questions.
 */
export function SkeletonQuestion({ className = '' }: SkeletonProps) {
  return (
    <div className={`space-y-4 ${className}`} aria-busy="true">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Skeleton for dashboard metrics.
 */
export function SkeletonMetric({ className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-4 ${className}`}
      aria-busy="true"
    >
      <Skeleton className="h-3 w-20 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

/**
 * Full page skeleton for initial page loads.
 */
export function PageSkeleton() {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Loading page">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  )
}
