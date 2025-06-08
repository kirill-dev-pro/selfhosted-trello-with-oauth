import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { api, HydrateClient } from '~/trpc/server'
import { MembersClient } from './_components/members-client'

export default async function MembersPage() {
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

  return (
    <HydrateClient>
      <MembersClient session={session} organization={organization} />
    </HydrateClient>
  )
}
