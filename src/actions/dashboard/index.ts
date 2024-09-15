// app/actions/dashboard-actions.ts
'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'

export const getDashboardData = async (startDate?: Date, endDate?: Date) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const validUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!validUser) return { status: 404, message: 'User not found' }

    const [totalTrips, totalDrivers, totalCustomers, totalVehicles, monthlyTrips] = await Promise.all([
      client.trip.count({
        where: {
          userId: validUser.id,
          ...(startDate && endDate ? { startTime: { gte: startDate, lte: endDate } } : {})
        }
      }),
      client.driver.count({ where: { userId: validUser.id } }),
      client.customer.count({ where: { userId: validUser.id } }),
      client.vehicle.count({ where: { userId: validUser.id } }),
      client.trip.groupBy({
        by: ['startTime'],
        where: {
          userId: validUser.id,
          ...(startDate && endDate ? { startTime: { gte: startDate, lte: endDate } } : {})
        },
        _count: true,
        orderBy: { startTime: 'asc' }
      })
    ])

    const monthlyTripData = monthlyTrips.map(item => ({
      month: item.startTime.toLocaleString('default', { month: 'short' }),
      count: item._count
    }))

    return {
      status: 200,
      data: {
        totalTrips,
        totalDrivers,
        totalCustomers,
        totalVehicles,
        monthlyTrips: monthlyTripData
      }
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return { status: 500, message: 'Internal server error' }
  }
}