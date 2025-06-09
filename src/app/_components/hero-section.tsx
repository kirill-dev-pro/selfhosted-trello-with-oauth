'use client'

import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'

export function HeroSection() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20">
      <div className="container mx-auto px-6 text-center">
        <div className="animate-fadeIn">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Everything App
            </span>
            <br />
            <span className="text-white">for your teams</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            Self-hosted project management that brings boards, wikis, and teams together. Take
            control of your data while supercharging your productivity.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg rounded-full shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
              onClick={() => router.push('/auth/signup')}
            >
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg rounded-full transition-all hover:scale-105"
              onClick={() => router.push('/auth/signin')}
            >
              Sign In
            </Button>
          </div>

          <div className="mt-12 text-sm text-gray-400">
            No credit card required • Self-hosted • Open source
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>
    </section>
  )
}
