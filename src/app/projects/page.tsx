'use client'

import { ArrowLeft, BookOpen, LayoutDashboard, Plus, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { api } from '~/trpc/react'

export default function ProjectsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: organization } = api.organization.get.useQuery()
  const { data: projects, isLoading } = api.project.getAll.useQuery(
    { organizationId: organization?.id ?? '' },
    { enabled: !!organization?.id },
  )

  const filteredProjects = projects?.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description &&
        project.description.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-2">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">All Projects</h1>
                <Badge variant="secondary">{filteredProjects?.length || 0} projects</Badge>
              </div>
            </div>
            <Button onClick={() => router.push('/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects && filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => router.push(`/projects/${project.id}/boards`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.color ?? '#3b82f6' }}
                    />
                    <span className="truncate">{project.name}</span>
                  </CardTitle>
                  {project.description && (
                    <CardDescription className="line-clamp-3">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span className="flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      {project.boards.length} boards
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {project.wikiPages.length} pages
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/projects/${project.id}/boards`)
                      }}
                      className="flex-1"
                    >
                      <LayoutDashboard className="h-3 w-3 mr-1" />
                      Boards
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/projects/${project.id}/wiki`)
                      }}
                      className="flex-1"
                    >
                      <BookOpen className="h-3 w-3 mr-1" />
                      Wiki
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <LayoutDashboard className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-gray-500 text-center mb-4">
                {searchQuery
                  ? `No projects match "${searchQuery}". Try a different search term.`
                  : 'Get started by creating your first project to organize your work.'}
              </p>
              {!searchQuery && (
                <Button onClick={() => router.push('/projects/new')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
