'use server'

import { client } from '@/lib/prisma'

export async function onCompleteUserRegistration(
  fullname: string,
  clerkId: string,
  type: string,
  district: string
) {
  try {
    const user = await client.user.create({
      data: {
        fullname,
        clerkId,
        type,
        district,
      },
    })

    return {
      status: 200,
      user,
    }
  } catch (error) {
    console.error('Error creating user:', error)
    return {
      status: 500,
      error: 'Failed to create user',
    }
  }
}