import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { api, HydrateClient } from '~/trpc/server'
import { SettingsClient } from './_components/settings-client'

export default async function SettingsPage() {
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

  // Get user profile and account info
  const userProfile = await api.user.getProfile()
  const accountInfo = await api.user.getAccountInfo()

  return (
    <HydrateClient>
      <SettingsClient
        session={session}
        organization={organization}
        userProfile={userProfile}
        accountInfo={accountInfo}
      />
    </HydrateClient>
  )
}
