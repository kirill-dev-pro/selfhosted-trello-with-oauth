'use client'

import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'

export function FooterSection() {
  const router = useRouter()

  return (
    <footer className="relative">
      {/* CTA Section */}
      <section className="py-24 relative">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Ready to get started?
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using Taski to ship faster and collaborate better.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 px-10 py-6 text-lg rounded-xl shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105"
            onClick={() => router.push('/auth/signup')}
          >
            🚀 Start Using Taski
          </Button>

          <p className="mt-6 text-sm text-gray-300">
            Completely free • Self-host or use hosted version • Bring your own OAuth OIDC
          </p>
        </div>
      </section>

      {/* Simple Footer */}
      <div className="border-t border-white/10 py-8">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="font-semibold text-white">Taski</span>
            </div>

            {/* Essential Links */}
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a
                href="https://github.com/kirill-dev-pro/selfhosted-trello-with-oauth"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                GitHub
              </a>
              <a
                href="https://github.com/kirill-dev-pro/selfhosted-trello-with-oauth/blob/main/docs/README.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Documentation
              </a>
              <a
                href="https://github.com/kirill-dev-pro/selfhosted-trello-with-oauth/blob/main/docs/setup-selfhosting.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Self-Hosting
              </a>
              <a
                href="https://klaud.me"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                Klaud.me ❤️
              </a>
            </div>

            {/* Copyright */}
            <p className="text-gray-400 text-sm">© 2024 Taski • Open Source</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
