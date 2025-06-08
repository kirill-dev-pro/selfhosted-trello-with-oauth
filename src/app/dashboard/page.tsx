import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { HydrateClient, api } from '~/trpc/server'
import { DashboardClient } from './_components/dashboard-client'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // Redirect to home if not authenticated
  if (!session?.user) {
    redirect('/')
  }

  // Check if organization exists
  const organization = await api.organization.get()
  if (!organization) {
    redirect('/setup')
  }

  // Get projects
  const projects = await api.project.getAll({ organizationId: organization.id })

  return (
    <HydrateClient>
      <DashboardClient session={session} organization={organization} projects={projects} />
    </HydrateClient>
  )
}
