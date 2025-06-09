import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '~/server/auth'
import { HydrateClient, api } from '~/trpc/server'
import { DeploymentOptions } from './_components/deployment-options'
import { FeaturesGrid } from './_components/features-grid'
import { FooterSection } from './_components/footer-section'
import { HeroSection } from './_components/hero-section'
import { NavBar } from './_components/navbar'
import { ProductShowcase } from './_components/product-showcase'
import { TeamSection } from './_components/team-section'
import { WikiShowcase } from './_components/wiki-showcase'

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  // If user is authenticated, check organization and redirect
  if (session?.user) {
    const organization = await api.organization.get()

    if (!organization) {
      redirect('/setup')
    } else {
      redirect('/dashboard')
    }
  }

  // Landing page for unauthenticated users
  return (
    <HydrateClient>
      <div className="min-h-screen bg-black text-white overflow-x-hidden">
        <NavBar />

        {/* Gradient Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-900/20 via-black to-purple-900/20 -z-10" />

        {/* Glowing orb effect */}
        <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] -z-10 animate-pulse" />

        <main>
          <HeroSection />
          <FeaturesGrid />
          <ProductShowcase />
          <WikiShowcase />
          <DeploymentOptions />
          <TeamSection />
          <FooterSection />
        </main>
      </div>
    </HydrateClient>
  )
}
