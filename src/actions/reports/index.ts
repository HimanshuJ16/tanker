// app/actions/report-actions.ts
'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'

export const getTripsReport = async (startDate?: Date, endDate?: Date) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const validUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!validUser) return { status: 404, message: 'User not found' }

    const trips = await client.trip.findMany({
      where: {
        userId: validUser.id,
        ...(startDate && endDate ? { startTime: { gte: startDate, lte: endDate } } : {})
      },
      include: {
        vehicle: true,
        driver: true,
        customer: true,
      },
      orderBy: { startTime: 'desc' }
    })

    const reportData = trips.map(trip => ({
      id: trip.id,
      startTime: trip.startTime,
      endTime: trip.endTime,
      distance: trip.distance,
      status: trip.status,
      vehicleNumber: trip.vehicle.vehicleNumber,
      driverName: `${trip.driver.firstName} ${trip.driver.lastName}`,
      customerName: trip.customer.name,
    }))

    return {
      status: 200,
      data: reportData
    }
  } catch (error) {
    console.error('Error fetching trips report:', error)
    return { status: 500, message: 'Internal server error' }
  }
}