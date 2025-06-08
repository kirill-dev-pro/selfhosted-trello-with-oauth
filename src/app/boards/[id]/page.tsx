'use client'

import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Edit,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Tag,
  Trash2,
  User,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import React, { useId, useState } from 'react'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import type { RouterOutputs } from '~/trpc/react'
import { api } from '~/trpc/react'
import { CardDetailDialog } from './_components/card-detail-dialog'

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

      {/* Kanban Board */}
      <main className="flex-1 overflow-x-auto p-4">
        <div className="flex space-x-6 h-full min-w-max">
          {board.lists.map((list: List) => (
            <div
              key={list.id}
              className="flex-shrink-0 w-80 bg-gray-100 rounded-lg p-4 h-fit max-h-[calc(100vh-12rem)] flex flex-col"
            >
              {/* List Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{list.name}</h3>
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary">{list.cards.length}</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit List
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete List
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {list.cards.map((card: KanbanCard) => (
                  <Card
                    key={card.id}
                    className="cursor-pointer hover:shadow-md transition-shadow bg-white"
                    onClick={() => handleCardClick(card.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                      {card.description && (
                        <CardDescription className="text-xs">{card.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center space-x-2">
                          {card.assignedTo && (
                            <div className="flex items-center">
                              <User className="h-3 w-3 mr-1" />
                              <span>{card.assignedTo.name || card.assignedTo.email}</span>
                            </div>
                          )}
                          {card.dueDate && (
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {card.labels.length > 0 && <Tag className="h-3 w-3" />}
                          {card.comments.length > 0 && (
                            <div className="flex items-center">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              <span>{card.comments.length}</span>
                            </div>
                          )}
                          {card.wikiPages && card.wikiPages.length > 0 && (
                            <div className="flex items-center">
                              <BookOpen className="h-3 w-3 mr-1" />
                              <span>{card.wikiPages.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge
                          variant={
                            card.priority === 'URGENT'
                              ? 'destructive'
                              : card.priority === 'HIGH'
                                ? 'default'
                                : card.priority === 'MEDIUM'
                                  ? 'secondary'
                                  : 'outline'
                          }
                        >
                          {card.priority}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Card Button */}
              <Button
                variant="ghost"
                className="w-full mt-4 border-2 border-dashed border-gray-300 hover:border-gray-400"
                onClick={() => {
                  setSelectedListId(list.id)
                  setIsCreateCardDialogOpen(true)
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add a card
              </Button>
            </div>
          ))}

          {/* Add List Column */}
          <div className="flex-shrink-0 w-80">
            <Button
              variant="ghost"
              className="w-full h-32 border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50/50"
              onClick={() => setIsCreateListDialogOpen(true)}
            >
              <Plus className="h-6 w-6 mr-2" />
              Add a list
            </Button>
          </div>
        </div>
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
