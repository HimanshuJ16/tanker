import { NextResponse } from 'next/server'
import { client } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Find the user by username
    const user = await client.user.findUnique({
      where: { username },
      include: { circle: true },
    })

    if (!user) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 })
    }

    // Check if the password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid username or password' }, { status: 401 })
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role, district: user.circle?.name },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    )

    // Set the token as an HTTP-only cookie
    const response = NextResponse.json({
      message: 'Authentication successful',
      district: user.circle?.name || 'unknown',
      role: user.role,
      id: user.id,
    })

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 86400, // 1 day
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Sign-in error:', error)
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 })
  }
}