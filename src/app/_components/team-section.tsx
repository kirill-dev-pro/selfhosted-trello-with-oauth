export function TeamSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-3xl p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-blue-400 to-green-500 bg-clip-text text-transparent">
                    Sync with GitHub.
                  </span>
                  <br />
                  <span className="text-white">Both ways.</span>
                </h2>
                <p className="text-gray-400 mb-8 text-lg">
                  Keep your code and project management in perfect harmony. Automatically sync
                  issues, pull requests, and milestones between GitHub and your boards.
                </p>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl">↔️</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Two-way synchronization</h4>
                      <p className="text-sm text-gray-500">
                        Changes sync instantly in both directions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl">🔐</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Secure connection</h4>
                      <p className="text-sm text-gray-500">
                        OAuth-based authentication keeps data safe
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                      <span className="text-xl">⚡</span>
                    </div>
                    <div>
                      <h4 className="font-semibold">Real-time updates</h4>
                      <p className="text-sm text-gray-500">
                        See changes as they happen across platforms
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <div className="bg-black/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-800 rounded-full"></div>
                      <span className="text-sm text-gray-400">GitHub Integration</span>
                    </div>
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  </div>

                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-lg p-3 animate-pulse">
                      <div className="h-2 bg-white/20 rounded w-3/4 mb-2"></div>
                      <div className="h-2 bg-white/10 rounded w-1/2"></div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 animate-pulse animation-delay-1000">
                      <div className="h-2 bg-white/20 rounded w-2/3 mb-2"></div>
                      <div className="h-2 bg-white/10 rounded w-3/4"></div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 animate-pulse animation-delay-2000">
                      <div className="h-2 bg-white/20 rounded w-4/5 mb-2"></div>
                      <div className="h-2 bg-white/10 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>

                {/* Floating connection lines */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32">
                  <div className="absolute inset-0 border-2 border-dashed border-white/10 rounded-full animate-spin-slow"></div>
                  <div className="absolute inset-4 border-2 border-dashed border-white/10 rounded-full animate-spin-slow animation-delay-1000"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
