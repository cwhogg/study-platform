import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find a Protocol',
  description: 'Browse available self-study protocols and join an N of 1 study. Track your outcomes with validated instruments across interventions like TRT, GLP-1s, supplements, and more.',
  openGraph: {
    title: 'Find a Protocol | N of One',
    description: 'Browse available self-study protocols and join an N of 1 study to track your outcomes.',
  },
  alternates: {
    canonical: '/protocols',
  },
}

export default function ProtocolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
