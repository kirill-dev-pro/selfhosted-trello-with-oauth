import { BookOpen, Calendar, ChevronRight, Clock, MessageSquare, Tag, User } from 'lucide-react'
import { useMemo } from 'react'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import type { RouterOutputs } from '~/trpc/react'

type Board = RouterOutputs['board']['getById']
type List = Board['lists'][0]
type WaterfallCard = List['cards'][0]

interface WaterfallViewProps {
  board: Board
  onCardClick: (cardId: string) => void
}

export function WaterfallView({ board, onCardClick }: WaterfallViewProps) {
  // Group cards by list and sort by priority/due date
  const waterfallData = useMemo(() => {
    return board.lists.map((list) => ({
      ...list,
      cards: list.cards.slice().sort((a, b) => {
        // Sort by priority first (URGENT > HIGH > MEDIUM > LOW)
        const priorityOrder = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 }
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] ?? 4
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] ?? 4

        if (aPriority !== bPriority) {
          return aPriority - bPriority
        }

        // Then sort by due date
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        }
        if (a.dueDate) return -1
        if (b.dueDate) return 1

        // Finally sort by creation date
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }),
    }))
  }, [board.lists])

  const getTaskDuration = (card: WaterfallCard) => {
    if (card.dueDate) {
      const now = new Date()
      const due = new Date(card.dueDate)
      const diffTime = due.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return 'Overdue'
      if (diffDays === 0) return 'Due today'
      if (diffDays === 1) return '1 day left'
      return `${diffDays} days left`
    }
    return 'No due date'
  }

  const getProgressColor = (listIndex: number, totalLists: number) => {
    const progress = listIndex / (totalLists - 1)
    if (progress <= 0.33) return 'bg-red-500'
    if (progress <= 0.66) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Waterfall View</h2>
          <p className="text-gray-600">Track task progression through different phases</p>
        </div>

        {/* Progress Timeline */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Project Phases</h3>
            <div className="text-sm text-gray-500">
              Total Cards: {board.lists.reduce((sum, list) => sum + list.cards.length, 0)}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {board.lists.map((list, index) => (
              <div key={list.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-4 h-4 rounded-full ${getProgressColor(index, board.lists.length)}`}
                  />
                  <div className="text-xs text-gray-600 mt-1 text-center max-w-20 truncate">
                    {list.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {list.cards.length} {list.cards.length === 1 ? 'card' : 'cards'}
                  </div>
                </div>
                {index < board.lists.length - 1 && (
                  <ChevronRight className="h-4 w-4 text-gray-400 mx-3" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Waterfall Stages */}
        <div className="space-y-8">
          {waterfallData.map((list, listIndex) => (
            <div key={list.id} className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${getProgressColor(listIndex, board.lists.length)}`}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">{list.name}</h3>
                    <Badge variant="secondary">{list.cards.length} tasks</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Phase {listIndex + 1} of {board.lists.length}
                  </div>
                </div>
              </div>

              {list.cards.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">No tasks in this phase</div>
              ) : (
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {list.cards.map((card, cardIndex) => (
                      <Card
                        key={card.id}
                        className="cursor-pointer hover:shadow-md transition-all duration-200 border-l-4"
                        style={{
                          borderLeftColor:
                            card.priority === 'URGENT'
                              ? '#dc2626'
                              : card.priority === 'HIGH'
                                ? '#ea580c'
                                : card.priority === 'MEDIUM'
                                  ? '#ca8a04'
                                  : '#65a30d',
                        }}
                        onClick={() => onCardClick(card.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <CardTitle className="text-sm font-medium line-clamp-2">
                              {card.title}
                            </CardTitle>
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
                              className="ml-2 flex-shrink-0"
                            >
                              {card.priority}
                            </Badge>
                          </div>
                          {card.description && (
                            <CardDescription className="text-xs line-clamp-2">
                              {card.description}
                            </CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pt-0">
                          {/* Task Timeline Info */}
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{getTaskDuration(card)}</span>
                            </div>
                            {card.dueDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span>{new Date(card.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>

                          {/* Assignee and Metadata */}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center space-x-2">
                              {card.assignedTo && (
                                <div className="flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  <span className="truncate max-w-20">
                                    {card.assignedTo.name || card.assignedTo.email}
                                  </span>
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

                          {/* Progress Indicator */}
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-500">Phase Progress</span>
                              <span className="font-medium">
                                {Math.round(((listIndex + 1) / board.lists.length) * 100)}%
                              </span>
                            </div>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${getProgressColor(listIndex, board.lists.length)}`}
                                style={{
                                  width: `${((listIndex + 1) / board.lists.length) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
