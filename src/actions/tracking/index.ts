// app/actions/tracking-actions.ts
'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'

// Simulated driver locations (in a real scenario, this would be a database or external service)
const driverLocations: { [key: string]: { lat: number; lng: number } } = {}

export const getConfirmedBookings = async () => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const validUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!validUser) return { status: 404, message: 'User not found' }

    const confirmedBookings = await client.booking.findMany({
      where: {
        userId: validUser.id,
        status: 'confirmed'
      },
      select: {
        id: true,
        vehicleNumber: true,
        customerName: true,
        vehicle: {
          select: {
            driver: {
              select: {
                contactNumber: true
              }
            }
          }
        }
      }
    })

    return { status: 200, data: confirmedBookings }
  } catch (error) {
    console.error('Error fetching confirmed bookings:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const startTracking = async (bookingId: string) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const booking = await client.booking.findUnique({
      where: { id: bookingId },
      include: { vehicle: { include: { driver: true } } }
    })

    if (!booking) return { status: 404, message: 'Booking not found' }

    const trip = await client.trip.create({
      data: {
        startTime: new Date(),
        status: 'in_progress',
        vehicleId: booking.vehicleId,
        driverId: booking.vehicle.driver?.id ?? '',
        customerId: booking.customerId,
        userId: booking.userId,
        bookingId: booking.id
      }
    })

    // Initialize simulated driver location
    const driverContactNumber = booking.vehicle.driver?.contactNumber ?? ''
    driverLocations[driverContactNumber] = {
      lat: 40.7128, // Example: New York City latitude
      lng: -74.0060 // Example: New York City longitude
    }

    return { 
      status: 200, 
      data: { 
        tripId: trip.id, 
        driverContactNumber: driverContactNumber
      } 
    }
  } catch (error) {
    console.error('Error starting tracking:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const getDriverLocation = async (driverContactNumber: string) => {
  // Simulate getting the driver's location
  if (driverContactNumber in driverLocations) {
    // Simulate movement
    driverLocations[driverContactNumber].lat += (Math.random() - 0.5) * 0.001
    driverLocations[driverContactNumber].lng += (Math.random() - 0.5) * 0.001

    return { status: 200, data: driverLocations[driverContactNumber] }
  } else {
    return { status: 404, message: 'Driver location not found' }
  }
}

export const endTracking = async (tripId: string) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const updatedTrip = await client.trip.update({
      where: { id: tripId },
      data: {
        endTime: new Date(),
        status: 'completed'
      },
      include: {
        vehicle: {
          include: {
            driver: true
          }
        }
      }
    })

    // Remove the driver's location from our simulated storage
    if (updatedTrip.vehicle.driver?.contactNumber) {
      delete driverLocations[updatedTrip.vehicle.driver.contactNumber]
    }

    return { status: 200, data: updatedTrip }
  } catch (error) {
    console.error('Error ending tracking:', error)
    return { status: 500, message: 'Internal server error' }
  }
}