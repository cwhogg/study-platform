import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create a Protocol',
  description: 'Design a personal study protocol with AI. Choose an intervention and goal, and our agents generate endpoints, PRO instruments, consent documents, and safety monitoring.',
  openGraph: {
    title: 'Create a Protocol | N of One',
    description: 'Design a personal study protocol with AI-generated endpoints, PRO instruments, and safety monitoring.',
  },
  alternates: {
    canonical: '/create',
  },
}

export default function CreateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
