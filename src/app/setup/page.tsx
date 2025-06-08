import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { api } from '~/trpc/server'
import { SetupForm } from './_components/setup-form'

export default async function SetupPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Redirect to home if not authenticated
  if (!session?.user) {
    redirect('/')
  }

  // Check if organization already exists
  const organization = await api.organization.get()
  if (organization) {
    redirect('/dashboard')
  }

  return <SetupForm />
}
