'use client'

import { BookOpen, LayoutDashboard, LogOut, Plus, Settings, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { signOut } from '~/lib/auth-client'

interface DashboardClientProps {
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
    members: Array<{
      id: string
      user: {
        id: string
        name: string | null
        email: string
      }
    }>
  }
  projects: Array<{
    id: string
    name: string
    description: string | null
    color: string | null
    boards: Array<{
      id: string
      name: string
    }>
    wikiPages: Array<{
      id: string
      title: string
    }>
  }>
}

export function DashboardClient({ session, organization, projects }: DashboardClientProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const userInitials = session.user.name
    ? session.user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : session.user.email?.charAt(0).toUpperCase() || 'U'

  const totalBoards = projects?.reduce((acc, project) => acc + project.boards.length, 0) ?? 0
  const totalWikiPages = projects?.reduce((acc, project) => acc + project.wikiPages.length, 0) ?? 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">{organization.name}</h1>
              <Badge variant="secondary">Dashboard</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => router.push('/settings')}>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm" onClick={() => router.push('/members')}>
                <Users className="h-4 w-4 mr-2" />
                Members
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session.user.image ?? undefined}
                        alt={session.user.name ?? ''}
                      />
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name?.split(' ')[0] || 'there'}! 👋
          </h2>
          <p className="text-gray-600">Here's what's happening with your projects and team.</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">Active projects</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Boards</CardTitle>
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalBoards}</div>
              <p className="text-xs text-muted-foreground">Kanban boards</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Wiki Pages</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalWikiPages}</div>
              <p className="text-xs text-muted-foreground">Documentation pages</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organization.members?.length ?? 0}</div>
              <p className="text-xs text-muted-foreground">Active members</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              onClick={() => router.push('/projects/new')}
              className="h-auto p-6 flex flex-col items-center space-y-2"
            >
              <Plus className="h-8 w-8" />
              <span className="font-medium">New Project</span>
              <span className="text-sm opacity-90">Start a new project</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/projects')}
              className="h-auto p-6 flex flex-col items-center space-y-2"
            >
              <LayoutDashboard className="h-8 w-8" />
              <span className="font-medium">View All Projects</span>
              <span className="text-sm opacity-70">Browse your projects</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/wiki')}
              className="h-auto p-6 flex flex-col items-center space-y-2"
            >
              <BookOpen className="h-8 w-8" />
              <span className="font-medium">Browse Wiki</span>
              <span className="text-sm opacity-70">View documentation</span>
            </Button>
          </div>
        </div>

        {/* Recent Projects */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Projects</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.slice(0, 6).map((project) => (
              <Card
                key={project.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => router.push(`/projects/${project.id}`)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.color || '#3b82f6' }}
                    />
                    <span>{project.name}</span>
                  </CardTitle>
                  {project.description && <CardDescription>{project.description}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center">
                      <LayoutDashboard className="h-4 w-4 mr-1" />
                      {project.boards.length} boards
                    </span>
                    <span className="flex items-center">
                      <BookOpen className="h-4 w-4 mr-1" />
                      {project.wikiPages.length} wiki pages
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Empty State */}
            {(!projects || projects.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <LayoutDashboard className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
                  <p className="text-gray-500 text-center mb-4">
                    Create your first project to start organizing tasks and documentation.
                  </p>
                  <Button onClick={() => router.push('/projects/new')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Project
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
