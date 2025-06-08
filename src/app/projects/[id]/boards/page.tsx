'use client'

import { ArrowLeft, Calendar, LayoutDashboard, Plus, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useId, useState } from 'react'
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
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'

interface ProjectBoardsPageProps {
  params: Promise<{ id: string }>
}

type Board = {
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
}

export default function ProjectBoardsPage({ params }: ProjectBoardsPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [boardDescription, setBoardDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  const boardNameId = useId()
  const boardDescriptionId = useId()
  const boardNameEmptyId = useId()
  const boardDescriptionEmptyId = useId()

  const { data: project, isLoading } = api.project.getById.useQuery({
    id: resolvedParams.id,
  })
  const { data: boards } = api.board.getByProject.useQuery(
    { projectId: resolvedParams.id },
    { enabled: !!resolvedParams.id },
  )

  const createBoard = api.board.create.useMutation({
    onSuccess: (board) => {
      setIsCreateDialogOpen(false)
      setBoardName('')
      setBoardDescription('')
      router.push(`/boards/${board.id}`)
    },
    onError: (error) => {
      console.error('Failed to create board:', error)
    },
  })

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!boardName || !resolvedParams.id) return

    setIsCreating(true)
    try {
      await createBoard.mutateAsync({
        name: boardName,
        description: boardDescription,
        projectId: resolvedParams.id,
      })
    } catch (error) {
      console.error('Error creating board:', error)
    } finally {
      setIsCreating(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!project) {
    return <div>Project not found</div>
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
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: project.color ?? '#3b82f6' }}
                />
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/projects/${project.id}/wiki`)}
              >
                Wiki
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Board
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Board</DialogTitle>
                    <DialogDescription>
                      Add a new Kanban board to organize your tasks
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateBoard} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={boardNameId}>Board Name</Label>
                      <Input
                        id={boardNameId}
                        value={boardName}
                        onChange={(e) => setBoardName(e.target.value)}
                        placeholder="Sprint Planning"
                        required
                        disabled={isCreating}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={boardDescriptionId}>Description (Optional)</Label>
                      <Textarea
                        id={boardDescriptionId}
                        value={boardDescription}
                        onChange={(e) => setBoardDescription(e.target.value)}
                        placeholder="Brief description of this board"
                        disabled={isCreating}
                        rows={3}
                      />
                    </div>
                    {createBoard.error && (
                      <div className="text-red-600 text-sm">{createBoard.error.message}</div>
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
                      <Button type="submit" disabled={isCreating || !boardName}>
                        {isCreating ? 'Creating...' : 'Create Board'}
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
        {project.description && (
          <div className="mb-8">
            <p className="text-gray-600">{project.description}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Boards</h2>

          {/* Boards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards?.map((board: Board) => (
              <Card
                key={board.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/boards/${board.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>{board.name}</span>
                  </CardTitle>
                  {board.description && <CardDescription>{board.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <LayoutDashboard className="h-4 w-4 mr-1" />
                        {board.lists.length} lists
                      </span>
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(board.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1 text-gray-400" />
                      <span className="text-sm text-gray-500">
                        Created by {board.createdBy.name || board.createdBy.email}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {(!boards || boards.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <LayoutDashboard className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No boards yet</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Create your first board to start organizing tasks with Kanban-style lists.
                  </p>
                  <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Board
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Create New Board</DialogTitle>
                        <DialogDescription>
                          Add a new Kanban board to organize your tasks
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleCreateBoard} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor={boardNameEmptyId}>Board Name</Label>
                          <Input
                            id={boardNameEmptyId}
                            value={boardName}
                            onChange={(e) => setBoardName(e.target.value)}
                            placeholder="Sprint Planning"
                            required
                            disabled={isCreating}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={boardDescriptionEmptyId}>Description (Optional)</Label>
                          <Textarea
                            id={boardDescriptionEmptyId}
                            value={boardDescription}
                            onChange={(e) => setBoardDescription(e.target.value)}
                            placeholder="Brief description of this board"
                            disabled={isCreating}
                            rows={3}
                          />
                        </div>
                        {createBoard.error && (
                          <div className="text-red-600 text-sm">{createBoard.error.message}</div>
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
                          <Button type="submit" disabled={isCreating || !boardName}>
                            {isCreating ? 'Creating...' : 'Create Board'}
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
