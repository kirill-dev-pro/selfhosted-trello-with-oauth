import {
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
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import type { RouterOutputs } from '~/trpc/react'

type Board = RouterOutputs['board']['getById']
type List = Board['lists'][0]
type KanbanCard = List['cards'][0]

interface KanbanViewProps {
  board: Board
  onCardClick: (cardId: string) => void
  onCreateCard: (listId: string) => void
  onCreateList: () => void
}

export function KanbanView({ board, onCardClick, onCreateCard, onCreateList }: KanbanViewProps) {
  return (
    <div className="flex-1 overflow-x-auto p-4">
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
                  onClick={() => onCardClick(card.id)}
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
              onClick={() => onCreateCard(list.id)}
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
            onClick={onCreateList}
          >
            <Plus className="h-6 w-6 mr-2" />
            Add a list
          </Button>
        </div>
      </div>
    </div>
  )
}
