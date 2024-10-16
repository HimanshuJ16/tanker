'use server'

import { client } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function onCompleteUserRegistration(
  fullname: string,
  clerkId: string,
  email: string,
  type: string,
  district: string,
  designation: string
) {
  try {
    // Find or create the Circle for the given district
    let circle = await client.circle.findFirst({
      where: { name: district },
    })

    if (!circle) {
      circle = await client.circle.create({
        data: { name: district },
      })
    }

    // Create the user
    const user = await client.user.create({
      data: {
        fullname,
        clerkId,
        email,
        type,
        district,
        designation,
        circle: {
          connect: { id: circle.id },
        },
      },
    })

    // Handle specific designations
    switch (designation) {
      case 'se':
        await client.se.create({
          data: {
            name: fullname,
            district,
            circle: { connect: { id: circle.id } },
          },
        })
        break
      case 'xen':
        const se = await client.se.findFirst({ where: { district } })
        if (!se) throw new Error('No SE found for this district')
        await client.xen.create({
          data: {
            name: fullname,
            district,
            circle: { connect: { id: circle.id } },
            se: { connect: { id: se.id } },
          },
        })
        break
      case 'aen':
        const xen = await client.xen.findFirst({ where: { district } })
        if (!xen) throw new Error('No XEN found for this district')
        await client.aen.create({
          data: {
            name: fullname,
            district,
            circle: { connect: { id: circle.id } },
            xen: { connect: { id: xen.id } },
          },
        })
        break
      case 'jen':
        const aen = await client.aen.findFirst({ where: { district } })
        if (!aen) throw new Error('No AEN found for this district')
        await client.jen.create({
          data: {
            name: fullname,
            district,
            circle: { connect: { id: circle.id } },
            aen: { connect: { id: aen.id } },
          },
        })
        break
    }

    return {
      status: 200,
      user,
    }
  } catch (error) {
    console.error('Error creating user:', error)
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
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