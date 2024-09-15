// app/actions/vehicle-actions.ts
'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'

export const getVehicles = async () => {
  const user = await currentUser()
  if (!user) return null

  try {
    const vehicles = await client.vehicle.findMany({
      where: {
        user: {
          clerkId: user.id
        }
      },
      include: {
        driver: true
      }
    })
    return vehicles
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return null
  }
}

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

export const addVehicle = async (data: {
  vehicleNumber: string
  driverId: string | null
}) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const validUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!validUser) return { status: 404, message: 'User not found' }

    const newVehicle = await client.vehicle.create({
      data: {
        vehicleNumber: data.vehicleNumber,
        driverId: data.driverId,
        userId: validUser.id
      }
    })

    revalidatePath('/vehicles')
    return { status: 200, message: 'Vehicle added successfully', data: newVehicle }
  } catch (error) {
    console.error('Error adding vehicle:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const updateVehicle = async (id: string, data: {
  vehicleNumber: string
  driverId: string | null
}) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const updatedVehicle = await client.vehicle.update({
      where: { id },
      data
    })

    revalidatePath('/vehicles')
    return { status: 200, message: 'Vehicle updated successfully', data: updatedVehicle }
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const deleteVehicle = async (id: string) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    await client.vehicle.delete({
      where: { id }
    })

    revalidatePath('/vehicles')
    return { status: 200, message: 'Vehicle deleted successfully' }
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return { status: 500, message: 'Internal server error' }
  }
}