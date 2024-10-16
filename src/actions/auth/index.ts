'use server'

import { client } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function onCompleteUserRegistration(
  fullname: string,
  clerkId: string,
  email: string,
  type: string,
  district: string
) {
  try {
    // First, find the Circle for the given district
    let circle = await client.circle.findFirst({
      where: { name: district },
    })

    // If the circle doesn't exist, create it
    if (!circle) {
      circle = await client.circle.create({
        data: { name: district },
      })
    }

    // Now create the user and associate it with the circle
    const user = await client.user.create({
      data: {
        fullname,
        clerkId,
        email,
        type,
        district,
        circle: {
          connect: { id: circle.id },
        },
      },
    })

    return {
      status: 200,
      user,
    }
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // The .code property can be accessed in a type-safe manner
      if (error.code === 'P2002') {
        return {
          status: 400,
          error: 'A user with this email already exists in the selected district.',
        }
      }
    }
    return {
      status: 500,
      error: 'Failed to create user',
    }
  }
}