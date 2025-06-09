'use client'

import { ArrowLeft, CalendarIcon, Kanban, Plus, Workflow } from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { Textarea } from '~/components/ui/textarea'
import type { RouterOutputs } from '~/trpc/react'
import { api } from '~/trpc/react'
import { CalendarView } from './_components/calendar-view'
import { CardDetailDialog } from './_components/card-detail-dialog'
import { KanbanView } from './_components/kanban-view'
import { WaterfallView } from './_components/waterfall-view'

interface BoardPageProps {
  params: Promise<{ id: string }>
}

type Board = RouterOutputs['board']['getById']
type List = Board['lists'][0]
type KanbanCard = List['cards'][0]

export default function BoardPage({ params }: BoardPageProps) {
  const resolvedParams = React.use(params)
  const router = useRouter()
  const [isCreateListDialogOpen, setIsCreateListDialogOpen] = useState(false)
  const [isCreateCardDialogOpen, setIsCreateCardDialogOpen] = useState(false)
  const [selectedListId, setSelectedListId] = useState<string>('')
  const [listName, setListName] = useState('')
  const [cardTitle, setCardTitle] = useState('')
  const [cardDescription, setCardDescription] = useState('')
  const [isCreatingList, setIsCreatingList] = useState(false)
  const [isCreatingCard, setIsCreatingCard] = useState(false)
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [isCardDetailOpen, setIsCardDetailOpen] = useState(false)
  const [activeView, setActiveView] = useState<'kanban' | 'waterfall' | 'calendar'>('kanban')

  const listNameId = useId()
  const cardTitleId = useId()
  const cardDescriptionId = useId()
  const listSelectId = useId()

  const { data: board, isLoading } = api.board.getById.useQuery({
    id: resolvedParams.id,
  })

  const utils = api.useUtils()

  const createList = api.board.createList.useMutation({
    onSuccess: () => {
      setIsCreateListDialogOpen(false)
      setListName('')
      void utils.board.getById.invalidate({ id: resolvedParams.id })
    },
    onError: (error) => {
      console.error('Failed to create list:', error)
    },
  })

  const createCard = api.card.create.useMutation({
    onSuccess: () => {
      setIsCreateCardDialogOpen(false)
      setCardTitle('')
      setCardDescription('')
      setSelectedListId('')
      void utils.board.getById.invalidate({ id: resolvedParams.id })
    },
    onError: (error) => {
      console.error('Failed to create card:', error)
    },
  })

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!listName || !board) return

    setIsCreatingList(true)
    try {
      await createList.mutateAsync({
        boardId: board.id,
        name: listName,
        position: board.lists.length,
      })
    } catch (error) {
      console.error('Error creating list:', error)
    } finally {
      setIsCreatingList(false)
    }
  }

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardTitle || !selectedListId) return

    setIsCreatingCard(true)
    try {
      const targetList = board?.lists.find((list) => list.id === selectedListId)
      await createCard.mutateAsync({
        title: cardTitle,
        description: cardDescription,
        listId: selectedListId,
        position: targetList?.cards.length ?? 0,
      })
    } catch (error) {
      console.error('Error creating card:', error)
    } finally {
      setIsCreatingCard(false)
    }
  }

  const handleCardClick = (cardId: string) => {
    setSelectedCardId(cardId)
    setIsCardDetailOpen(true)
  }

  const handleCloseCardDetail = () => {
    setIsCardDetailOpen(false)
    setSelectedCardId(null)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!board) {
    return <div>Board not found</div>
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-sm border-b flex-shrink-0">
        <div className="max-w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/projects/${board.project.id}/boards`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project
              </Button>
              <div className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: board.project.color ?? '#3b82f6' }}
                />
                <h1 className="text-2xl font-bold text-gray-900">{board.name}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* View Selector */}
              <Tabs
                value={activeView}
                onValueChange={(value) => setActiveView(value as typeof activeView)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="kanban" className="flex items-center gap-2">
                    <Kanban className="h-4 w-4" />
                    Kanban
                  </TabsTrigger>
                  <TabsTrigger value="waterfall" className="flex items-center gap-2">
                    <Workflow className="h-4 w-4" />
                    Waterfall
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    Calendar
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <Dialog open={isCreateListDialogOpen} onOpenChange={setIsCreateListDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    New List
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New List</DialogTitle>
                    <DialogDescription>Add a new list to organize your cards</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateList} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={listNameId}>List Name</Label>
                      <Input
                        id={listNameId}
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                        placeholder="To Do"
                        required
                        disabled={isCreatingList}
                      />
                    </div>
                    {createList.error && (
                      <div className="text-red-600 text-sm">{createList.error.message}</div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateListDialogOpen(false)}
                        disabled={isCreatingList}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isCreatingList || !listName}>
                        {isCreatingList ? 'Creating...' : 'Create List'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <Dialog open={isCreateCardDialogOpen} onOpenChange={setIsCreateCardDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Card
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Card</DialogTitle>
                    <DialogDescription>Add a new card to track a task</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCard} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={listSelectId}>List</Label>
                      <select
                        id={listSelectId}
                        value={selectedListId}
                        onChange={(e) => setSelectedListId(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md"
                        required
                        disabled={isCreatingCard}
                      >
                        <option value="">Select a list</option>
                        {board.lists.map((list) => (
                          <option key={list.id} value={list.id}>
                            {list.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={cardTitleId}>Card Title</Label>
                      <Input
                        id={cardTitleId}
                        value={cardTitle}
                        onChange={(e) => setCardTitle(e.target.value)}
                        placeholder="Task title"
                        required
                        disabled={isCreatingCard}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={cardDescriptionId}>Description (Optional)</Label>
                      <Textarea
                        id={cardDescriptionId}
                        value={cardDescription}
                        onChange={(e) => setCardDescription(e.target.value)}
                        placeholder="Task description"
                        disabled={isCreatingCard}
                        rows={3}
                      />
                    </div>
                    {createCard.error && (
                      <div className="text-red-600 text-sm">{createCard.error.message}</div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsCreateCardDialogOpen(false)}
                        disabled={isCreatingCard}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isCreatingCard || !cardTitle || !selectedListId}
                      >
                        {isCreatingCard ? 'Creating...' : 'Create Card'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          {board.description && (
            <div className="pb-4">
              <p className="text-gray-600">{board.description}</p>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Tabs
          value={activeView}
          onValueChange={(value) => setActiveView(value as typeof activeView)}
        >
          <TabsContent value="kanban" className="h-full mt-0">
            <KanbanView
              board={board}
              onCardClick={handleCardClick}
              onCreateCard={(listId) => {
                setSelectedListId(listId)
                setIsCreateCardDialogOpen(true)
              }}
              onCreateList={() => setIsCreateListDialogOpen(true)}
            />
          </TabsContent>
          <TabsContent value="waterfall" className="h-full mt-0">
            <WaterfallView board={board} onCardClick={handleCardClick} />
          </TabsContent>
          <TabsContent value="calendar" className="h-full mt-0">
            <CalendarView board={board} onCardClick={handleCardClick} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Card Detail Dialog */}
      <CardDetailDialog
        cardId={selectedCardId}
        isOpen={isCardDetailOpen}
        onClose={handleCloseCardDetail}
      />
    </div>
  )
}
