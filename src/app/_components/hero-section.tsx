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
              Taski
            </span>
            <br />
            <span className="text-white">ultimate selfhosted opensource</span>
            <br />
            <span className="text-white">project management application</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
            The ultimate selfhosted opensource project management application that brings boards,
            wikis, and teams together. Use it self-hosted or with our hosted version using your own
            OAuth OIDC provider. Proudly sponsored by{' '}
            <span className="text-blue-400 font-semibold">Klaud.me</span> for free identity
            management.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105"
              onClick={() => router.push('/auth/signup')}
            >
              🚀 Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg rounded-xl transition-all duration-200 hover:scale-105"
              onClick={() => router.push('/auth/signin')}
            >
              Sign In
            </Button>
            <a
              href="https://github.com/kirill-dev-pro/selfhosted-trello-with-oauth"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white/10 backdrop-blur-sm px-8 py-6 text-lg rounded-xl transition-all duration-200 hover:scale-105 font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>

          <div className="mt-12 text-sm text-gray-400">
            100% Free • Self-hosted or Hosted • OAuth OIDC Ready • Open source
          </div>
        </div>

        {/* Animated background elements */}
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>
    </section>
  )
}
