'use client'

import { ArrowLeft, Check, Mail, Shield, Trash2, User, UserCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useId, useState } from 'react'
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
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui/tabs'
import { api } from '~/trpc/react'

interface SettingsClientProps {
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
  }
  userProfile: {
    id: string
    name: string
    email: string
    emailVerified: boolean
    image: string | null
    createdAt: Date
    updatedAt: Date
  }
  accountInfo: {
    hasPassword: boolean
    providers: string[]
  }
}

export function SettingsClient({
  session,
  organization,
  userProfile,
  accountInfo,
}: SettingsClientProps) {
  const router = useRouter()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [name, setName] = useState(userProfile.name)
  const [email, setEmail] = useState(userProfile.email)
  const [isSaving, setIsSaving] = useState(false)

  const nameId = useId()
  const emailId = useId()

  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: () => {
      setIsEditingProfile(false)
      router.refresh()
    },
    onError: (error) => {
      console.error('Failed to update profile:', error)
    },
  })

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSaving(true)
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        email: email !== userProfile.email ? email : undefined,
      })
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setName(userProfile.name)
    setEmail(userProfile.email)
    setIsEditingProfile(false)
  }

  const userInitials = userProfile.name
    ? userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
    : userProfile.email?.charAt(0).toUpperCase() || 'U'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <UserCircle className="h-5 w-5" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Update your profile information and public display settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={userProfile.image ?? undefined} alt={userProfile.name} />
                    <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">{userProfile.name}</h3>
                    <p className="text-sm text-gray-500">{userProfile.email}</p>
                    <Button variant="outline" size="sm" disabled>
                      Change Avatar (Coming Soon)
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Profile Form */}
                {isEditingProfile ? (
                  <form onSubmit={handleSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={nameId}>Full Name</Label>
                        <Input
                          id={nameId}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your full name"
                          required
                          disabled={isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={emailId}>Email Address</Label>
                        <Input
                          id={emailId}
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          disabled={isSaving}
                        />
                        {!userProfile.emailVerified && (
                          <p className="text-sm text-amber-600">Email not verified</p>
                        )}
                      </div>
                    </div>
                    {updateProfile.error && (
                      <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                        {updateProfile.error.message}
                      </div>
                    )}
                    <div className="flex space-x-2">
                      <Button type="submit" disabled={isSaving || !name.trim()}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Full Name</Label>
                        <p className="mt-1 text-sm text-gray-900">{userProfile.name}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Email Address</Label>
                        <div className="mt-1 flex items-center space-x-2">
                          <p className="text-sm text-gray-900">{userProfile.email}</p>
                          {userProfile.emailVerified ? (
                            <Badge variant="secondary" className="text-xs">
                              <Check className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs">
                              Not Verified
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setIsEditingProfile(true)}>
                      <User className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Account Security</span>
                </CardTitle>
                <CardDescription>
                  Manage your account security settings and authentication methods.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connected Accounts */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Connected Accounts</h3>
                  <div className="space-y-3">
                    {accountInfo.providers.map((provider) => (
                      <div
                        key={provider}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center">
                            <Mail className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium capitalize">{provider}</p>
                            <p className="text-xs text-gray-500">
                              {provider === 'credential' ? 'Email & Password' : `${provider} OAuth`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">Connected</Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Password Section */}
                {accountInfo.hasPassword && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Password</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Password</p>
                          <p className="text-xs text-gray-500">Last updated recently</p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          Change Password (Coming Soon)
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Organization Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Organization</h3>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="text-sm font-medium">{organization.name}</p>
                      <p className="text-xs text-gray-500">Self-hosted instance</p>
                    </div>
                    <Badge variant="secondary">Member</Badge>
                  </div>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                  <div className="border border-red-200 rounded-lg p-4 bg-red-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Delete Account</h4>
                        <p className="text-xs text-red-600">
                          Permanently delete your account and all associated data.
                        </p>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Account</DialogTitle>
                            <DialogDescription>
                              This feature is coming soon. Contact your administrator if you need to
                              delete your account.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex justify-end">
                            <Button variant="outline">Close</Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preferences</CardTitle>
                <CardDescription>
                  Customize your experience and notification settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center py-8">
                    <p className="text-gray-500">Preferences settings coming soon!</p>
                    <p className="text-sm text-gray-400 mt-2">
                      We're working on adding customization options for your experience.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
