'use client'

import { Eye, EyeOff, Github, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useId, useState } from 'react'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Separator } from '~/components/ui/separator'
import { authClient } from '~/lib/auth-client'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const emailId = useId()
  const passwordId = useId()

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      })

      if (result.error) {
        setError(result.error.message || 'Failed to sign in')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Sign in error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGitHubSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/dashboard',
      })

      if (result.error) {
        setError(result.error.message || 'Failed to sign in with GitHub')
        setIsLoading(false)
      }
      // If successful, the page will redirect automatically
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('GitHub sign in error:', err)
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/dashboard',
      })

      if (result.error) {
        setError(result.error.message || 'Failed to sign in with Google')
        setIsLoading(false)
      }
      // If successful, the page will redirect automatically
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Google sign in error:', err)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue to your projects</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Social Sign In Buttons */}
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGitHubSignIn}
              disabled={isLoading}
            >
              <Github className="h-4 w-4 mr-2" />
              Continue with GitHub
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <Mail className="h-4 w-4 mr-2" />
              Continue with Google
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor={emailId}>Email</Label>
              <Input
                id={emailId}
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={passwordId}>Password</Label>
              <div className="relative">
                <Input
                  id={passwordId}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-md p-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading || !email || !password}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center text-sm">
            <span className="text-gray-500">Don't have an account? </span>
            <Link href="/auth/signup" className="text-blue-600 hover:text-blue-800 font-medium">
              Sign up
            </Link>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
              ← Back to home
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
