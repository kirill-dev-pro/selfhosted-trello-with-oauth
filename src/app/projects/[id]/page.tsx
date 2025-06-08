import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { api, HydrateClient } from '~/trpc/server'
import { ProjectClient } from './_components/project-client'

interface ProjectPageProps {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const resolvedParams = await params
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

  // Get project details
  const project = await api.project.getById({ id: resolvedParams.id })

  // Get project boards and wiki pages
  const boards = await api.board.getByProject({ projectId: resolvedParams.id })
  const wikiPages = await api.wiki.getByProject({ projectId: resolvedParams.id })

  return (
    <HydrateClient>
      <ProjectClient
        session={session}
        organization={organization}
        project={project}
        boards={boards}
        wikiPages={wikiPages}
      />
    </HydrateClient>
  )
}
