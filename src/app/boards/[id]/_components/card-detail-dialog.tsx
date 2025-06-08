'use client'

import { BookOpen, Calendar, MessageSquare, Plus, Tag, User, X } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'

interface CardDetailDialogProps {
  cardId: string | null
  isOpen: boolean
  onClose: () => void
}

interface WikiPageReference {
  wikiPageId: string
  wikiPage: {
    id: string
    title: string
    slug: string
    project: {
      id: string
      name: string
      color: string | null
    }
    createdBy: {
      id: string
      name: string | null
      email: string
    }
  }
}

export function CardDetailDialog({ cardId, isOpen, onClose }: CardDetailDialogProps) {
  const [showWikiPageSelector, setShowWikiPageSelector] = useState(false)
  const [comment, setComment] = useState('')
  const [isAddingComment, setIsAddingComment] = useState(false)

  const { data: card, isLoading } = api.card.getById.useQuery(
    { id: cardId! },
    { enabled: !!cardId },
  )

  const { data: availableWikiPages } = api.card.getAvailableWikiPages.useQuery(
    { cardId: cardId! },
    { enabled: !!cardId },
  )

  const utils = api.useUtils()

  const addWikiPageReference = api.card.addWikiPageReference.useMutation({
    onSuccess: () => {
      void utils.card.getById.invalidate({ id: cardId! })
      void utils.card.getAvailableWikiPages.invalidate({ cardId: cardId! })
      setShowWikiPageSelector(false)
    },
  })

  const removeWikiPageReference = api.card.removeWikiPageReference.useMutation({
    onSuccess: () => {
      void utils.card.getById.invalidate({ id: cardId! })
      void utils.card.getAvailableWikiPages.invalidate({ cardId: cardId! })
    },
  })

  const addComment = api.card.addComment.useMutation({
    onSuccess: () => {
      void utils.card.getById.invalidate({ id: cardId! })
      setComment('')
      setIsAddingComment(false)
    },
  })

  const handleAddWikiPage = (wikiPageId: string) => {
    if (!cardId) return
    addWikiPageReference.mutate({ cardId, wikiPageId })
  }

  const handleRemoveWikiPage = (wikiPageId: string) => {
    if (!cardId) return
    removeWikiPageReference.mutate({ cardId, wikiPageId })
  }

  const handleAddComment = () => {
    if (!cardId || !comment.trim()) return
    addComment.mutate({ cardId, content: comment.trim() })
  }

  if (isLoading || !card) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div>Loading card details...</div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <span>{card.title}</span>
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
          </DialogTitle>
          <DialogDescription>
            in <strong>{card.list.name}</strong> • {card.list.board.name}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              {card.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{card.description}</p>
              ) : (
                <p className="text-gray-500 italic">No description provided</p>
              )}
            </div>

            {/* Wiki Page References */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Referenced Wiki Pages
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowWikiPageSelector(!showWikiPageSelector)}
                  disabled={!availableWikiPages || availableWikiPages.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Reference
                </Button>
              </div>

              {/* Wiki Page Selector */}
              {showWikiPageSelector && availableWikiPages && availableWikiPages.length > 0 && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Select a wiki page to reference:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {availableWikiPages.map((wikiPage) => (
                      <button
                        key={wikiPage.id}
                        type="button"
                        onClick={() => handleAddWikiPage(wikiPage.id)}
                        disabled={addWikiPageReference.isPending}
                        className="w-full text-left p-2 hover:bg-white rounded border border-gray-200 disabled:opacity-50"
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: wikiPage.project.color ?? '#3b82f6' }}
                          />
                          <span className="font-medium">{wikiPage.title}</span>
                          <span className="text-sm text-gray-500">({wikiPage.project.name})</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWikiPageSelector(false)}
                    className="mt-2"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Referenced Wiki Pages List */}
              {card.wikiPages && card.wikiPages.length > 0 ? (
                <div className="space-y-2">
                  {card.wikiPages.map((ref: WikiPageReference) => (
                    <div
                      key={ref.wikiPageId}
                      className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={`/wiki/${ref.wikiPage.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-blue-700 hover:text-blue-800 hover:underline"
                            >
                              {ref.wikiPage.title}
                            </a>
                            <div className="flex items-center space-x-1">
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{
                                  backgroundColor: ref.wikiPage.project.color ?? '#3b82f6',
                                }}
                              />
                              <span className="text-xs text-gray-600">
                                {ref.wikiPage.project.name}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">
                            by {ref.wikiPage.createdBy.name || ref.wikiPage.createdBy.email}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveWikiPage(ref.wikiPageId)}
                        disabled={removeWikiPageReference.isPending}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No wiki pages referenced</p>
              )}
            </div>

            {/* Comments */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Comments ({card.comments.length})
              </h3>

              {/* Add Comment */}
              {isAddingComment ? (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                  <div className="space-y-3">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write a comment..."
                      rows={3}
                    />
                    <div className="flex items-center space-x-2">
                      <Button
                        onClick={handleAddComment}
                        disabled={!comment.trim() || addComment.isPending}
                        size="sm"
                      >
                        {addComment.isPending ? 'Adding...' : 'Add Comment'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingComment(false)
                          setComment('')
                        }}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsAddingComment(true)}
                  className="mb-4"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Comment
                </Button>
              )}

              {/* Comments List */}
              {card.comments.length > 0 ? (
                <div className="space-y-3">
                  {card.comments.map((comment: any) => (
                    <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">
                          {comment.author.name || comment.author.email}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No comments yet</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Card Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-600">Created by</p>
                    <p className="font-medium">{card.createdBy.name || card.createdBy.email}</p>
                  </div>
                </div>

                {card.assignedTo && (
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Assigned to</p>
                      <p className="font-medium">{card.assignedTo.name || card.assignedTo.email}</p>
                    </div>
                  </div>
                )}

                {card.dueDate && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-600">Due date</p>
                      <p className="font-medium">{new Date(card.dueDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Labels */}
            {card.labels && card.labels.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <Tag className="h-5 w-5 mr-2" />
                  Labels
                </h3>
                <div className="flex flex-wrap gap-2">
                  {card.labels.map((cardLabel: any) => (
                    <Badge
                      key={cardLabel.labelId}
                      variant="outline"
                      style={{ backgroundColor: cardLabel.label.color + '20' }}
                    >
                      {cardLabel.label.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
