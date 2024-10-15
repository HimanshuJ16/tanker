'use server'

import { client } from '@/lib/prisma'

export const onCompleteUserRegistration = async (
  fullname: string,
  clerkId: string,
  type: string,
  district: string
) => {
  try {
    const registered = await client.user.create({
      data: {
        fullname,
        clerkId,
        type,
        district,
      },
      select: {
        fullname: true,
        id: true,
        type: true,
        district: true,
      },
    })

    if (registered) {
      return { status: 200, user: registered }
    }
  } catch (error) {
    return { status: 400 }
  }
}