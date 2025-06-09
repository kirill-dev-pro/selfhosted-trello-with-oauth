'use client'

import { useState } from 'react'
import { Card } from '~/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState('boards')

  const showcases = {
    boards: {
      title: 'Kanban Boards',
      description:
        'Drag and drop tasks between columns. Customize workflows, add labels, set due dates, and track progress visually. Perfect for agile teams.',
      image: '/api/placeholder/1200/800',
      features: [
        'Customizable columns and workflows',
        'Task assignments and team collaboration',
        'Due dates, reminders, and time tracking',
        'Labels, priorities, and custom fields',
        'Card dependencies and blocking relationships',
        'Activity feeds and comment threads',
      ],
    },
    wiki: {
      title: 'Team Wiki & Knowledge Base',
      description:
        'Create a centralized knowledge hub with powerful editing tools. Build documentation, processes, guides, and searchable content that grows with your team.',
      image: '/api/placeholder/1200/800',
      features: [
        'Rich text editor with markdown support',
        'Complete version history and change tracking',
        'Advanced search across all pages',
        'Page linking and cross-references',
        'File attachments and media embedding',
        'Collaborative editing with real-time sync',
        'Templates for common document types',
        'Export to PDF and other formats',
      ],
    },
    collaboration: {
      title: 'Real-time Collaboration',
      description:
        'Work together seamlessly across boards and wiki. Comment on tasks, mention team members, and stay synchronized with instant updates.',
      image: '/api/placeholder/1200/800',
      features: [
        'Real-time updates across all features',
        'Comments, mentions, and notifications',
        'Activity feeds and change tracking',
        'Team member presence indicators',
        'Shared workspaces and permissions',
        'Integration with external tools',
      ],
    },
  }

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Work together
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Like in the office. Powerful features that make remote work feel natural.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 bg-white/5 backdrop-blur-sm border border-white/10">
            <TabsTrigger value="boards" className="data-[state=active]:bg-white/10">
              Boards
            </TabsTrigger>
            <TabsTrigger value="wiki" className="data-[state=active]:bg-white/10">
              Wiki
            </TabsTrigger>
            <TabsTrigger value="collaboration" className="data-[state=active]:bg-white/10">
              Collaboration
            </TabsTrigger>
          </TabsList>

          {Object.entries(showcases).map(([key, showcase]) => (
            <TabsContent key={key} value={key} className="mt-12">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                <div className="order-2 lg:order-1">
                  <h3 className="text-3xl font-bold mb-4">{showcase.title}</h3>
                  <p className="text-gray-400 mb-8 text-lg">{showcase.description}</p>

                  <ul className="space-y-3">
                    {showcase.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="order-1 lg:order-2">
                  <Card className="bg-white/5 backdrop-blur-sm border-white/10 p-4 shadow-2xl shadow-purple-500/10">
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-6xl mb-4">
                          {key === 'boards' && '📋'}
                          {key === 'wiki' && '📚'}
                          {key === 'collaboration' && '👥'}
                        </div>
                        <p className="text-gray-500">Product Screenshot</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
