'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'

export const getDrivers = async () => {
  const user = await currentUser()
  if (!user) return null

  try {
    const drivers = await client.driver.findMany({
      where: {
        user: {
          clerkId: user.id
        }
      }
    })
    return drivers
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return null
  }
}

export const addDriver = async (data: {
  firstName: string
  lastName: string
  licenseNumber: string
  contactNumber: string
  status: string
}) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const validUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!validUser) return { status: 404, message: 'User not found' }

    const newDriver = await client.driver.create({
      data: {
        ...data,
        userId: validUser.id
      }
    })

    revalidatePath('/drivers')
    return { status: 200, message: 'Driver added successfully', data: newDriver }
  } catch (error) {
    console.error('Error adding driver:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const updateDriver = async (id: string, data: {
  firstName: string
  lastName: string
  licenseNumber: string
  contactNumber: string
  status: string
}) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const updatedDriver = await client.driver.update({
      where: { id },
      data
    })

    revalidatePath('/drivers')
    return { status: 200, message: 'Driver updated successfully', data: updatedDriver }
  } catch (error) {
    console.error('Error updating driver:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const deleteDriver = async (id: string) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    await client.driver.delete({
      where: { id }
    })

    revalidatePath('/drivers')
    return { status: 200, message: 'Driver deleted successfully' }
  } catch (error) {
    console.error('Error deleting driver:', error)
    return { status: 500, message: 'Internal server error' }
  }
}