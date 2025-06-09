import { Calendar, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import type { RouterOutputs } from '~/trpc/react'

type Board = RouterOutputs['board']['getById']
type List = Board['lists'][0]
type CalendarCard = List['cards'][0]

interface CalendarViewProps {
  board: Board
  onCardClick: (cardId: string) => void
}

interface CalendarData {
  date: Date
  cards: (CalendarCard & { listName: string })[]
  isCurrentMonth: boolean
  isToday: boolean
}

export function CalendarView({ board, onCardClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get all cards with due dates
  const allCards = useMemo(() => {
    return board.lists.flatMap((list) =>
      list.cards.map((card) => ({
        ...card,
        listName: list.name,
      })),
    ) as (CalendarCard & { listName: string })[]
  }, [board.lists])

  // Generate calendar data
  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    // Get first day of month and adjust for week start (Sunday = 0)
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startCalendar = new Date(firstDay)
    startCalendar.setDate(firstDay.getDate() - firstDay.getDay())

    // Get last day and adjust for week end
    const endCalendar = new Date(lastDay)
    endCalendar.setDate(lastDay.getDate() + (6 - lastDay.getDay()))

    const days: CalendarData[] = []
    const current = new Date(startCalendar)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    while (current <= endCalendar) {
      const currentDateStr = current.toDateString()
      const isCurrentMonth = current.getMonth() === month
      const isToday = current.getTime() === today.getTime()

      // Find cards due on this date
      const cardsForDay = allCards.filter((card) => {
        if (!card.dueDate) return false
        const cardDate = new Date(card.dueDate)
        cardDate.setHours(0, 0, 0, 0)
        return cardDate.toDateString() === currentDateStr
      })

      days.push({
        date: new Date(current),
        cards: cardsForDay,
        isCurrentMonth,
        isToday,
      })

      current.setDate(current.getDate() + 1)
    }

    return days
  }, [currentDate, allCards])

  // Get cards without due dates
  const cardsWithoutDueDate = useMemo(() => {
    return allCards.filter((card) => !card.dueDate)
  }, [allCards])

  // Get overdue cards
  const overdueCards = useMemo(() => {
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    return allCards.filter((card) => {
      if (!card.dueDate) return false
      return new Date(card.dueDate) < today
    })
  }, [allCards])

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Calendar View</h2>
              <p className="text-gray-600">View tasks organized by due dates</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={goToToday}>
                Today
              </Button>
              <Button variant="outline" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              {overdueCards.length > 0 && (
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>{overdueCards.length} overdue</span>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span>{cardsWithoutDueDate.length} no due date</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Calendar Header */}
          <div className="grid grid-cols-7 border-b">
            {dayNames.map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-600 border-r last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Body */}
          <div className="grid grid-cols-7">
            {calendarData.map((day, index) => (
              <div
                key={index}
                className={`min-h-32 p-2 border-r border-b last:border-r-0 ${
                  day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                } ${day.isToday ? 'bg-blue-50' : ''}`}
              >
                <div
                  className={`text-sm font-medium mb-2 ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${day.isToday ? 'text-blue-600' : ''}`}
                >
                  {day.date.getDate()}
                </div>

                <div className="space-y-1">
                  {day.cards.slice(0, 3).map((card) => {
                    const isOverdue = new Date(card.dueDate!) < new Date()
                    return (
                      <button
                        key={card.id}
                        className={`text-xs p-1 rounded cursor-pointer hover:shadow-sm transition-shadow w-full text-left ${
                          isOverdue ? 'bg-red-100 border-red-200' : 'bg-blue-100 border-blue-200'
                        } border`}
                        onClick={() => onCardClick(card.id)}
                        type="button"
                      >
                        <div className="font-medium truncate">{card.title}</div>
                        <div className="flex items-center justify-between mt-1">
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
                            className="text-xs"
                          >
                            {card.priority}
                          </Badge>
                          <span className="text-gray-500 text-xs">{card.listName}</span>
                        </div>
                      </button>
                    )
                  })}
                  {day.cards.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{day.cards.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Side Panels */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Overdue Cards */}
          {overdueCards.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b bg-red-50">
                <h4 className="font-semibold text-red-900 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Overdue Tasks ({overdueCards.length})
                </h4>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {overdueCards.map((card) => (
                  <Card
                    key={card.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-red-500"
                    onClick={() => onCardClick(card.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                      {card.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {card.description}
                        </CardDescription>
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
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span className="text-red-600 font-medium">
                              Due {new Date(card.dueDate!).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">{card.listName}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cards Without Due Date */}
          {cardsWithoutDueDate.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h4 className="font-semibold text-gray-900 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  No Due Date ({cardsWithoutDueDate.length})
                </h4>
              </div>
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {cardsWithoutDueDate.map((card) => (
                  <Card
                    key={card.id}
                    className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-gray-400"
                    onClick={() => onCardClick(card.id)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                      {card.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {card.description}
                        </CardDescription>
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
                        <Badge variant="outline">{card.listName}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
