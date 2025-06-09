'use client'

import { Card, CardContent } from '~/components/ui/card'

export function WikiShowcase() {
  const wikiFeatures = [
    {
      icon: '✍️',
      title: 'Rich Text Editor',
      description: 'Powerful editor with markdown support, formatting options, and live preview',
    },
    {
      icon: '📖',
      title: 'Version History',
      description: 'Complete change tracking with diff views and rollback capabilities',
    },
    {
      icon: '🔍',
      title: 'Advanced Search',
      description: 'Full-text search across all pages with filters and smart suggestions',
    },
    {
      icon: '🔗',
      title: 'Page Linking',
      description: 'Cross-reference pages with automatic link detection and suggestions',
    },
    {
      icon: '📎',
      title: 'File Attachments',
      description: 'Embed images, documents, and media directly in your pages',
    },
    {
      icon: '👥',
      title: 'Collaborative Editing',
      description: 'Real-time collaboration with conflict resolution and presence indicators',
    },
    {
      icon: '📋',
      title: 'Templates',
      description: 'Pre-built templates for common document types and processes',
    },
    {
      icon: '📤',
      title: 'Export Options',
      description: 'Export to PDF, Markdown, HTML, and other formats',
    },
  ]

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Powerful Wiki System
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Build a comprehensive knowledge base with advanced features that grow with your team.
            Perfect for documentation, processes, guides, and institutional knowledge.
          </p>
        </div>

        {/* Main Wiki Feature Showcase */}
        <div className="max-w-6xl mx-auto mb-16">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
            <CardContent className="p-0">
              <div className="grid lg:grid-cols-2">
                <div className="p-12">
                  <h3 className="text-3xl font-bold mb-6 text-white">
                    Everything you need for knowledge management
                  </h3>
                  <p className="text-gray-300 text-lg mb-8">
                    Create, organize, and share knowledge with a wiki system designed for modern
                    teams. From simple notes to complex documentation structures.
                  </p>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400">📝</span>
                      </div>
                      <span className="text-gray-200">Rich formatting with markdown support</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400">🌐</span>
                      </div>
                      <span className="text-gray-200">
                        Connected to your project boards and tasks
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-purple-400">🔒</span>
                      </div>
                      <span className="text-gray-200">Granular permissions and access control</span>
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-12 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-8xl mb-4">📚</div>
                    <p className="text-gray-300">Wiki Interface Preview</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {wikiFeatures.map((feature, index) => (
            <Card
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <CardContent className="p-6 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h4 className="text-lg font-semibold mb-2 text-white">{feature.title}</h4>
                <p className="text-gray-300 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Use Cases */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8 text-white">Perfect for every team</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">Startups</h4>
              <p className="text-gray-300 text-sm">
                Document processes as you scale and preserve knowledge
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏢</span>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">Enterprise</h4>
              <p className="text-gray-300 text-sm">
                Centralize institutional knowledge and maintain compliance
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💻</span>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">Development</h4>
              <p className="text-gray-300 text-sm">
                Technical documentation linked to your development workflow
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
