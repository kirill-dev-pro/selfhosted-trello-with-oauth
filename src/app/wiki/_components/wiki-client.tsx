'use client'

import { ArrowLeft, BookOpen, Calendar, FileText, Plus, Search, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useId, useMemo, useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'

interface WikiClientProps {
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
    project: {
      id: string
      name: string
      color: string | null
    }
  }>
  projects: Array<{
    id: string
    name: string
    description: string | null
    color: string | null
  }>
}

export function WikiClient({ session, organization, wikiPages, projects }: WikiClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedProject, setSelectedProject] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPageTitle, setNewPageTitle] = useState('')
  const [newPageContent, setNewPageContent] = useState('')
  const [newPageProject, setNewPageProject] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const searchId = useId()
  const titleId = useId()
  const contentId = useId()

  const createWikiPage = api.wiki.createSimple.useMutation({
    onSuccess: (wikiPage) => {
      setIsCreateDialogOpen(false)
      setNewPageTitle('')
      setNewPageContent('')
      setNewPageProject('')
      router.push(`/wiki/${wikiPage.id}`)
    },
    onError: (error) => {
      console.error('Failed to create wiki page:', error)
    },
  })

  const handleCreatePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPageTitle.trim() || !newPageProject) return

    setIsCreating(true)
    try {
      await createWikiPage.mutateAsync({
        title: newPageTitle.trim(),
        content: newPageContent.trim(),
        projectId: newPageProject,
        published: true,
      })
    } catch (error) {
      console.error('Error creating wiki page:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const filteredWikiPages = useMemo(() => {
    let filtered = wikiPages

    // Filter by project
    if (selectedProject !== 'all') {
      filtered = filtered.filter((page) => page.project.id === selectedProject)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (page) =>
          page.title.toLowerCase().includes(query) ||
          page.content.toLowerCase().includes(query) ||
          page.project.name.toLowerCase().includes(query),
      )
    }

    return filtered
  }, [wikiPages, selectedProject, searchQuery])

  // Group by project for display
  const groupedPages = useMemo(() => {
    const grouped = new Map<string, typeof filteredWikiPages>()

    filteredWikiPages.forEach((page) => {
      const projectId = page.project.id
      if (!grouped.has(projectId)) {
        grouped.set(projectId, [])
      }
      grouped.get(projectId)!.push(page)
    })

    return grouped
  }, [filteredWikiPages])

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
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Wiki</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Page
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Wiki Page</DialogTitle>
                    <DialogDescription>
                      Add a new page to document and share knowledge
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreatePage} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={titleId}>Page Title</Label>
                      <Input
                        id={titleId}
                        value={newPageTitle}
                        onChange={(e) => setNewPageTitle(e.target.value)}
                        placeholder="Getting Started Guide"
                        required
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Project</Label>
                      <Select
                        value={newPageProject}
                        onValueChange={setNewPageProject}
                        disabled={isCreating}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id}>
                              <div className="flex items-center space-x-2">
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: project.color ?? '#3b82f6' }}
                                />
                                <span>{project.name}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={contentId}>Initial Content (Optional)</Label>
                      <Textarea
                        id={contentId}
                        value={newPageContent}
                        onChange={(e) => setNewPageContent(e.target.value)}
                        placeholder="Start writing your content here..."
                        disabled={isCreating}
                        rows={5}
                      />
                    </div>
                    {createWikiPage.error && (
                      <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                        {createWikiPage.error.message}
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                        disabled={isCreating}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isCreating || !newPageTitle.trim() || !newPageProject}
                      >
                        {isCreating ? 'Creating...' : 'Create Page'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id={searchId}
                type="text"
                placeholder="Search wiki pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="w-full sm:w-64">
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger>
                <SelectValue placeholder="All projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: project.color ?? '#3b82f6' }}
                      />
                      <span>{project.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Wiki Pages */}
        <div className="space-y-8">
          {filteredWikiPages.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || selectedProject !== 'all'
                    ? 'No pages found'
                    : 'No wiki pages yet'}
                </h3>
                <p className="text-gray-500 text-center mb-4">
                  {searchQuery || selectedProject !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Create your first wiki page to start documenting knowledge.'}
                </p>
                {!searchQuery && selectedProject === 'all' && (
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Page
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Wiki Page</DialogTitle>
                        <DialogDescription>
                          Add a new page to document and share knowledge
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreatePage} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={`${titleId}-empty`}>Page Title</Label>
                          <Input
                            id={`${titleId}-empty`}
                            value={newPageTitle}
                            onChange={(e) => setNewPageTitle(e.target.value)}
                            placeholder="Getting Started Guide"
                            required
                            disabled={isCreating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Project</Label>
                          <Select
                            value={newPageProject}
                            onValueChange={setNewPageProject}
                            disabled={isCreating}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  <div className="flex items-center space-x-2">
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: project.color ?? '#3b82f6' }}
                                    />
                                    <span>{project.name}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${contentId}-empty`}>Initial Content (Optional)</Label>
                          <Textarea
                            id={`${contentId}-empty`}
                            value={newPageContent}
                            onChange={(e) => setNewPageContent(e.target.value)}
                            placeholder="Start writing your content here..."
                            disabled={isCreating}
                            rows={5}
                          />
                        </div>
                        {createWikiPage.error && (
                          <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                            {createWikiPage.error.message}
                          </div>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsCreateDialogOpen(false)}
                            disabled={isCreating}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={isCreating || !newPageTitle.trim() || !newPageProject}
                          >
                            {isCreating ? 'Creating...' : 'Create Page'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                )}
              </CardContent>
            </Card>
          ) : (
            Array.from(groupedPages.entries()).map(([projectId, pages]) => {
              const project = projects.find((p) => p.id === projectId)
              if (!project) return null

              return (
                <div key={projectId} className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.color ?? '#3b82f6' }}
                    />
                    <h2 className="text-xl font-semibold text-gray-900">{project.name}</h2>
                    <Badge variant="secondary">
                      {pages.length} page{pages.length !== 1 ? 's' : ''}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.map((page) => (
                      <Card
                        key={page.id}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => router.push(`/wiki/${page.id}`)}
                      >
                        <CardHeader>
                          <CardTitle className="flex items-center space-x-2">
                            <FileText className="h-5 w-5" />
                            <span className="line-clamp-2">{page.title}</span>
                          </CardTitle>
                          <CardDescription className="line-clamp-3">
                            {page.content
                              ? page.content.replace(/[#*`]/g, '').substring(0, 150) +
                                (page.content.length > 150 ? '...' : '')
                              : 'No content yet.'}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>{page.createdBy.name || page.createdBy.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          {page.lastEditedBy && page.lastEditedBy.id !== page.createdBy.id && (
                            <div className="mt-2 text-xs text-gray-400">
                              Last edited by {page.lastEditedBy.name || page.lastEditedBy.email}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
