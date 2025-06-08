import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { api, HydrateClient } from '~/trpc/server'
import { WikiClient } from './_components/wiki-client'

export default async function WikiPage() {
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

  // Get all wiki pages and projects
  const wikiPages = await api.wiki.getAll()
  const projects = await api.project.getAll({ organizationId: organization.id })

  return (
    <HydrateClient>
      <WikiClient
        session={session}
        organization={organization}
        wikiPages={wikiPages}
        projects={projects}
      />
    </HydrateClient>
  )
}
