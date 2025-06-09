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
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of teams already using TaskFlow to ship faster and collaborate better.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white border-0 px-10 py-6 text-lg rounded-full shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 hover:scale-105"
            onClick={() => router.push('/auth/signup')}
          >
            Start Your Free Trial
          </Button>

          <p className="mt-6 text-sm text-gray-500">
            14-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer Links */}
      <div className="border-t border-white/10 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4 text-gray-300">Product</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Features
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Pricing
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Roadmap
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Changelog
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-300">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Documentation
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    API Reference
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Guides
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Blog
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-300">Company</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    About
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Contact
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Terms
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-gray-300">Connect</h3>
              <ul className="space-y-2">
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    GitHub
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Twitter
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    Discord
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-white transition-colors text-left"
                  >
                    LinkedIn
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="font-semibold">TaskFlow</span>
            </div>

            <p className="text-gray-400 text-sm">
              © 2024 TaskFlow. All rights reserved. Self-hosted with ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
