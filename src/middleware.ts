import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  district: string
  role: string
  userId: string
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isPublicPath = path === '/auth/sign-in' || path === '/auth/sign-up'

  const token = request.cookies.get('token')?.value || ''

  if (isPublicPath && token) {
    try {
      const decodedToken = jwtDecode(token) as DecodedToken
      const { district, role, userId } = decodedToken
      return NextResponse.redirect(new URL(`/${district}/${role}/${userId}/dashboard`, request.url))
    } catch (error) {
      console.error('Error decoding token:', error)
      // If there's an error decoding the token, we'll just continue to the public path
    }
  }

  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/auth/sign-in', request.nextUrl))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/auth/sign-in',
    '/auth/sign-up',
    '/:district/:role/:id/dashboard',
  ],
}