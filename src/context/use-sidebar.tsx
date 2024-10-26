'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { deleteCookie } from 'cookies-next'

const useSideBar = () => {
  const [expand, setExpand] = useState<boolean | undefined>(undefined)
  const router = useRouter()
  const pathname = usePathname()

  const page = pathname.split('/').pop()

  const onSignOut = async () => {
    try {
      // Delete the token cookie
      deleteCookie('token', { path: '/' })

      // Make a request to the server to invalidate the session
      const response = await fetch('/api/auth/signout', {
        method: 'POST',
        credentials: 'include',
      })

      if (response.ok) {
        // Redirect to the sign-in page
        router.push('/auth/sign-in')
      } else {
        console.error('Failed to sign out')
      }
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  const onExpand = () => setExpand((prev) => !prev)

  return {
    expand,
    onExpand,
    page,
    onSignOut,
  }
}

export default useSideBar