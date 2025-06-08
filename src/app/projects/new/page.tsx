'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'

const PROJECT_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#ec4899', // Pink
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6b7280', // Gray
]

export default function NewProjectPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0])
  const [isLoading, setIsLoading] = useState(false)

  const nameId = useId()
  const descriptionId = useId()

  const { data: organization } = api.organization.get.useQuery()

  const createProject = api.project.create.useMutation({
    onSuccess: (project) => {
      router.push(`/projects/${project.id}/boards`)
    },
    onError: (error) => {
      console.error('Failed to create project:', error)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization?.id) return

    setIsLoading(true)

    try {
      await createProject.mutateAsync({
        name,
        description,
        color: selectedColor,
        organizationId: organization.id,
      })
    } catch (error) {
      console.error('Error creating project:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!organization) {
    return <div>Loading...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Create a new project to organize your boards and wiki pages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor={nameId}>Project Name</Label>
                <Input
                  id={nameId}
                  type="text"
                  placeholder="Marketing Campaign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={descriptionId}>Description (Optional)</Label>
                <Textarea
                  id={descriptionId}
                  placeholder="Brief description of your project"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Project Color</Label>
                <div className="grid grid-cols-5 gap-3">
                  {PROJECT_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`w-12 h-12 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? 'border-gray-900 scale-110'
                          : 'border-gray-200 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              {createProject.error && (
                <div className="text-red-600 text-sm">{createProject.error.message}</div>
              )}

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading || !name}>
                  {isLoading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
