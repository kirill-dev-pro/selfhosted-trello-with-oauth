export function FeaturesGrid() {
  const features = [
    {
      icon: '📋',
      title: 'Kanban Boards',
      description:
        'Visualize your workflow with drag-and-drop boards. Organize tasks, track progress, and stay on top of deadlines.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '📚',
      title: 'Powerful Wiki System',
      description:
        'Create comprehensive documentation with rich text editing, version history, page linking, and powerful search. Perfect for team knowledge management.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: '👥',
      title: 'Real-time Collaboration',
      description:
        'Work together seamlessly. See updates instantly, leave comments, and keep everyone in sync across all features.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: '🔒',
      title: 'Self-Hosted Security',
      description:
        'Your data, your servers, your rules. Complete control over your sensitive information and compliance.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description:
        'Built for speed. Instant loading, smooth interactions, and a responsive experience across all devices.',
      gradient: 'from-yellow-500 to-amber-500',
    },
    {
      icon: '🔗',
      title: 'OAuth OIDC Integration',
      description:
        'Secure authentication with your favorite providers. Use Klaud.me for free identity management or bring your own provider.',
      gradient: 'from-indigo-500 to-purple-500',
    },
  ]

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Unmatched productivity
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Everything you need to manage projects, collaborate with your team, and ship faster.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}
              />

              <div className="relative z-10">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
