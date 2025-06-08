'use client'

import { useRouter } from 'next/navigation'
import { Button } from '~/components/ui/button'

export function AuthButtons() {
  const router = useRouter()

  const handleSignIn = () => {
    router.push('/auth/signin')
  }

  const handleSignUp = () => {
    router.push('/auth/signup')
  }

  return (
    <div className="flex gap-4">
      <Button size="lg" onClick={handleSignIn} className="bg-blue-600 hover:bg-blue-700">
        Sign In
      </Button>
      <Button size="lg" variant="outline" onClick={handleSignUp}>
        Sign Up
      </Button>
    </div>
  )
}
