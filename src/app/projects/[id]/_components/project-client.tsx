'use client'

import { ArrowLeft, BookOpen, Calendar, FileText, LayoutDashboard, Plus, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'

interface ProjectClientProps {
  session: {
    user: {
      id: string
      name: string
      email: string
      image?: string | null
    }
  }
  organization: {
    id: string
    name: string
  }
  project: {
    id: string
    name: string
    description: string | null
    color: string | null
    createdAt: Date
    updatedAt: Date
  }
  boards: Array<{
    id: string
    name: string
    description: string | null
    createdAt: Date
    lists: Array<{
      id: string
      name: string
      cards: Array<{ id: string }>
    }>
    createdBy: {
      id: string
      name: string | null
      email: string
    }
  }>
  wikiPages: Array<{
    id: string
    title: string
    content: string
    slug: string
    published: boolean
    createdAt: Date
    updatedAt: Date
    createdBy: {
      id: string
      name: string
      email: string
    }
    lastEditedBy: {
      id: string
      name: string
      email: string
    } | null
  }>
}

export function ProjectClient({
  session,
  organization,
  project,
  boards,
  wikiPages,
}: ProjectClientProps) {
  const router = useRouter()

  // Calculate some stats
  const totalLists = boards.reduce((sum, board) => sum + board.lists.length, 0)
  const totalCards = boards.reduce(
    (sum, board) => sum + board.lists.reduce((listSum, list) => listSum + list.cards.length, 0),
    0,
  )

  // Get recent items (last 5)
  const recentBoards = boards
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const recentWikiPages = wikiPages
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

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
              <div className="flex items-center space-x-3">
                <div
                  className="w-6 h-6 rounded-full"
                  style={{ backgroundColor: project.color ?? '#3b82f6' }}
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                  {project.description && (
                    <p className="text-sm text-gray-500">{project.description}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/projects/${project.id}/wiki`)}
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Wiki
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/projects/${project.id}/boards`)}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Boards
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <LayoutDashboard className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{boards.length}</p>
                  <p className="text-sm text-gray-500">Board{boards.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <FileText className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalLists}</p>
                  <p className="text-sm text-gray-500">List{totalLists !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <Users className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{totalCards}</p>
                  <p className="text-sm text-gray-500">Card{totalCards !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-gray-900">{wikiPages.length}</p>
                  <p className="text-sm text-gray-500">
                    Wiki Page{wikiPages.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Boards */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <LayoutDashboard className="h-5 w-5" />
                  <span>Recent Boards</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/projects/${project.id}/boards`)}
                >
                  View All
                </Button>
              </div>
              <CardDescription>Latest Kanban boards for organizing tasks</CardDescription>
            </CardHeader>
            <CardContent>
              {recentBoards.length === 0 ? (
                <div className="text-center py-8">
                  <LayoutDashboard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No boards yet</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/projects/${project.id}/boards`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Board
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentBoards.map((board) => (
                    <button
                      key={board.id}
                      type="button"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors w-full text-left"
                      onClick={() => router.push(`/boards/${board.id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{board.name}</h4>
                        {board.description && (
                          <p className="text-sm text-gray-500 mt-1">{board.description}</p>
                        )}
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span>{board.lists.length} lists</span>
                          <span>
                            {board.lists.reduce((sum, list) => sum + list.cards.length, 0)} cards
                          </span>
                          <span>{new Date(board.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        by {board.createdBy.name || board.createdBy.email}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Wiki Pages */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Recent Wiki Pages</span>
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/projects/${project.id}/wiki`)}
                >
                  View All
                </Button>
              </div>
              <CardDescription>Latest documentation and knowledge base articles</CardDescription>
            </CardHeader>
            <CardContent>
              {recentWikiPages.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No wiki pages yet</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/projects/${project.id}/wiki`)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Page
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentWikiPages.map((page) => (
                    <button
                      key={page.id}
                      type="button"
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors w-full text-left"
                      onClick={() => router.push(`/wiki/${page.id}`)}
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{page.title}</h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {page.content
                            ? page.content.replace(/[#*`]/g, '').substring(0, 100) +
                              (page.content.length > 100 ? '...' : '')
                            : 'No content yet.'}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(page.updatedAt).toLocaleDateString()}
                          </span>
                          {page.lastEditedBy && page.lastEditedBy.id !== page.createdBy.id && (
                            <span>
                              Edited by {page.lastEditedBy.name || page.lastEditedBy.email}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {page.published ? 'Published' : 'Draft'}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for this project</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push(`/projects/${project.id}/boards`)}
              >
                <LayoutDashboard className="h-6 w-6 mb-2" />
                <span>Manage Boards</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push(`/projects/${project.id}/wiki`)}
              >
                <BookOpen className="h-6 w-6 mb-2" />
                <span>Browse Wiki</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push('/wiki')}
              >
                <FileText className="h-6 w-6 mb-2" />
                <span>All Wiki Pages</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col"
                onClick={() => router.push('/dashboard')}
              >
                <ArrowLeft className="h-6 w-6 mb-2" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
