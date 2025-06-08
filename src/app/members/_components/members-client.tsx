'use client'

import {
  ArrowLeft,
  Crown,
  Mail,
  MoreHorizontal,
  Shield,
  Trash2,
  User,
  UserPlus,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { api } from '~/trpc/react'

interface MembersClientProps {
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
      role: 'OWNER' | 'ADMIN' | 'MEMBER'
      joinedAt: Date
      user: {
        id: string
        name: string | null
        email: string
        image?: string | null
      }
    }>
  }
}

export function MembersClient({ session, organization }: MembersClientProps) {
  const router = useRouter()
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [newMemberEmail, setNewMemberEmail] = useState('')
  const [newMemberRole, setNewMemberRole] = useState<'MEMBER' | 'ADMIN'>('MEMBER')
  const [isAdding, setIsAdding] = useState(false)

  const emailId = 'email-' + Math.random().toString(36).substr(2, 9)
  const roleId = 'role-' + Math.random().toString(36).substr(2, 9)

  const utils = api.useUtils()

  // Check if current user is owner or admin
  const currentMember = organization.members.find((member) => member.user.id === session.user.id)
  const canManageMembers = currentMember?.role === 'OWNER' || currentMember?.role === 'ADMIN'

  const addMember = api.organization.addMember.useMutation({
    onSuccess: () => {
      void utils.organization.get.invalidate()
      setIsAddMemberOpen(false)
      setNewMemberEmail('')
      setNewMemberRole('MEMBER')
      setIsAdding(false)
    },
    onError: (error) => {
      console.error('Failed to add member:', error)
      setIsAdding(false)
    },
  })

  const removeMember = api.organization.removeMember.useMutation({
    onSuccess: () => {
      void utils.organization.get.invalidate()
    },
    onError: (error) => {
      console.error('Failed to remove member:', error)
    },
  })

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMemberEmail || !canManageMembers) return

    setIsAdding(true)
    try {
      await addMember.mutateAsync({
        organizationId: organization.id,
        email: newMemberEmail,
        role: newMemberRole,
      })
    } catch (error) {
      console.error('Error adding member:', error)
    }
  }

  const handleRemoveMember = (userId: string) => {
    if (!canManageMembers) return

    removeMember.mutate({
      organizationId: organization.id,
      userId,
    })
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER':
        return <Crown className="h-4 w-4 text-yellow-600" />
      case 'ADMIN':
        return <Shield className="h-4 w-4 text-blue-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'OWNER':
        return (
          <Badge variant="default" className="bg-yellow-600">
            Owner
          </Badge>
        )
      case 'ADMIN':
        return (
          <Badge variant="default" className="bg-blue-600">
            Admin
          </Badge>
        )
      default:
        return <Badge variant="secondary">Member</Badge>
    }
  }

  const getUserInitials = (user: { name: string | null; email: string }) => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    }
    return user.email.charAt(0).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
                <Badge variant="secondary">{organization.name}</Badge>
              </div>
            </div>
            {canManageMembers && (
              <Dialog open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Team Member</DialogTitle>
                    <DialogDescription>
                      Invite a new member to your organization. They must already have an account.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor={emailId}>Email Address</Label>
                      <Input
                        id={emailId}
                        type="email"
                        value={newMemberEmail}
                        onChange={(e) => setNewMemberEmail(e.target.value)}
                        placeholder="member@example.com"
                        required
                        disabled={isAdding}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={roleId}>Role</Label>
                      <Select
                        value={newMemberRole}
                        onValueChange={(value) => setNewMemberRole(value as 'MEMBER' | 'ADMIN')}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MEMBER">Member</SelectItem>
                          <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {addMember.error && (
                      <div className="text-red-600 text-sm">{addMember.error.message}</div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsAddMemberOpen(false)}
                        disabled={isAdding}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={isAdding || !newMemberEmail}>
                        {isAdding ? 'Adding...' : 'Add Member'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Members</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organization.members.length}</div>
              <p className="text-xs text-muted-foreground">Active team members</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  organization.members.filter((m) => m.role === 'ADMIN' || m.role === 'OWNER')
                    .length
                }
              </div>
              <p className="text-xs text-muted-foreground">Administrators</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Organization</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{organization.name}</div>
              <p className="text-xs text-muted-foreground">Self-hosted instance</p>
            </CardContent>
          </Card>
        </div>

        {/* Members List */}
        <Card>
          <CardHeader>
            <CardTitle>Organization Members</CardTitle>
            <CardDescription>
              Manage team members and their roles within your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organization.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.user.image ?? undefined}
                        alt={member.user.name ?? ''}
                      />
                      <AvatarFallback>{getUserInitials(member.user)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.name || member.user.email}
                        </p>
                        {member.user.id === session.user.id && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <Mail className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Joined {new Date(member.joinedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.role)}
                      {getRoleBadge(member.role)}
                    </div>
                    {canManageMembers &&
                      member.role !== 'OWNER' &&
                      member.user.id !== session.user.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRemoveMember(member.user.id)}
                              className="text-red-600"
                              disabled={removeMember.isPending}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Role Information</CardTitle>
            <CardDescription>
              Understanding different member roles and their permissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Crown className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Owner</h4>
                  <p className="text-sm text-gray-600">
                    Full access to all organization features. Can manage all members, projects, and
                    settings. Cannot be removed from the organization.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Admin</h4>
                  <p className="text-sm text-gray-600">
                    Can manage members, create and manage projects, and access all organizational
                    features. Can add and remove other members (except owners).
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <User className="h-5 w-5 text-gray-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Member</h4>
                  <p className="text-sm text-gray-600">
                    Can access and contribute to projects they're assigned to. Can create and edit
                    content within projects but cannot manage organization settings or other
                    members.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
