import { NextResponse } from 'next/server'
import { client } from '@/lib/prisma'

export async function POST(req: Request) {
  const { email, district } = await req.json()

  try {
    const existingUser = await client.user.findFirst({
      where: {
        email,
        district,
      },
    })

    return NextResponse.json({ exists: !!existingUser })
  } catch (error) {
    console.error('Error checking user existence:', error)
    return NextResponse.json({ error: 'Failed to check user existence' }, { status: 500 })
  }
}