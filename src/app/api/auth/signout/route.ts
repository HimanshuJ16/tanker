import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  // Clear the token cookie
  cookies().delete('token')

  // You can add any additional server-side logout logic here
  // For example, invalidating the session in your database

  return NextResponse.json({ success: true })
}