'use client'

import { useRouter } from 'next/navigation'
import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { api } from '~/trpc/react'

export function SetupForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [slug, setSlug] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const nameId = useId()
  const slugId = useId()
  const descriptionId = useId()

  const createOrganization = api.organization.create.useMutation({
    onSuccess: () => {
      router.push('/dashboard')
    },
    onError: (error) => {
      console.error('Failed to create organization:', error)
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await createOrganization.mutateAsync({
        name,
        description,
        slug,
      })
    } catch (error) {
      console.error('Error creating organization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!slug || slug === generateSlug(name)) {
      setSlug(generateSlug(value))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Setup Your Organization</CardTitle>
          <CardDescription>
            Create your organization to get started with project management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={nameId}>Organization Name</Label>
              <Input
                id={nameId}
                type="text"
                placeholder="My Company"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={slugId}>URL Slug</Label>
              <Input
                id={slugId}
                type="text"
                placeholder="my-company"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                disabled={isLoading}
                pattern="^[a-z0-9-]+$"
                title="Only lowercase letters, numbers, and hyphens are allowed"
              />
              <p className="text-sm text-gray-500">This will be used in URLs and must be unique</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={descriptionId}>Description (Optional)</Label>
              <Textarea
                id={descriptionId}
                placeholder="Brief description of your organization"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isLoading}
                rows={3}
              />
            </div>

            {createOrganization.error && (
              <div className="text-red-600 text-sm">{createOrganization.error.message}</div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !name || !slug}>
              {isLoading ? 'Creating...' : 'Create Organization'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Self-Hosted Version</h3>
            <p className="text-sm text-blue-700">
              This self-hosted version supports only one organization. Once created, you can invite
              team members and start managing your projects.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
