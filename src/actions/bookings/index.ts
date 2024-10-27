'use server'

import { client } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from  'next/headers'
import { verify } from 'jsonwebtoken'
import { BookingSchemaType } from '@/schemas/booking.schema'

interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    const dbUser = await client.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, district: true, username: true, role: true }
    })

    return dbUser
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export const getBookings = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  try {
    let bookings

    switch (currentUser.role) {
      case 'contractor':
        bookings = await client.booking.findMany({
          where: {
            jen: {
              contractor: {
                username: currentUser.username
              }
            }
          },
          include: {
            vendor: true,
            jen: true,
            customer: true,
            vehicle: true,
            hydrant: true,
            destination: true
          }
        })
        break

      case 'aen':
        bookings = await client.booking.findMany({
          where: {
            jen: {
              aen: {
                username: currentUser.username
              }
            }
          },
          include: {
            vendor: true,
            jen: true,
            customer: true,
            vehicle: true,
            hydrant: true,
            destination: true
          }
        })
        break

      case 'jen':
        bookings = await client.booking.findMany({
          where: {
            jen: { username: currentUser.username }
          },
          include: {
            vendor: true,
            jen: true,
            customer: true,
            vehicle: true,
            hydrant: true,
            destination: true
          }
        })
        break

      case 'vendor':
        bookings = await client.booking.findMany({
          where: {
            vendor: { username: currentUser.username }
          },
          include: {
            vendor: true,
            jen: true,
            customer: true,
            vehicle: true,
            hydrant: true,
            destination: true
          }
        })
        break

      default:
        throw new Error('Unauthorized to view bookings')
    }

    return bookings
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return null
  }
}

export const addBooking = async (data: BookingSchemaType) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  if (!['contractor', 'aen', 'jen'].includes(currentUser.role)) {
    return { status: 403, message: 'Unauthorized to add bookings' }
  }

  try {
    const vendor = await client.vendor.findUnique({
      where: { id: data.vendorId },
      include: { jen: true }
    })

    if (!vendor) {
      throw new Error('Vendor not found')
    }

    const newBooking = await client.booking.create({
      data: {
        type: data.type,
        bookingType: data.bookingType,
        scheduledDateTime: data.scheduledDateTime,
        vendor: { connect: { id: data.vendorId } },
        jen: { connect: { id: vendor.jen.id } },
        customer: { connect: { id: data.customerId } },
        vehicle: { connect: { id: data.vehicleId } },
        hydrant: { connect: { id: data.hydrantId } },
        destination: { connect: { id: data.destinationId } },
      },
    })

    revalidatePath('/bookings')
    return { status: 200, message: 'Booking added successfully', data: newBooking }
  } catch (error) {
    console.error('Error adding booking:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const updateBooking = async (id: string, data: BookingSchemaType) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  if (!['contractor', 'aen', 'jen'].includes(currentUser.role)) {
    return { status: 403, message: 'Unauthorized to update bookings' }
  }

  try {
    const updatedBooking = await client.booking.update({
      where: { id },
      data: {
        type: data.type,
        bookingType: data.bookingType,
        scheduledDateTime: data.scheduledDateTime,
        vendor: { connect: { id: data.vendorId } },
        customer: { connect: { id: data.customerId } },
        vehicle: { connect: { id: data.vehicleId } },
        hydrant: { connect: { id: data.hydrantId } },
        destination: { connect: { id: data.destinationId } },
      },
    })

    revalidatePath('/bookings')
    return { status: 200, message: 'Booking updated successfully', data: updatedBooking }
  } catch (error) {
    console.error('Error updating booking:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const deleteBooking = async (id: string) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  if (!['contractor', 'aen', 'jen'].includes(currentUser.role)) {
    return { status: 403, message: 'Unauthorized to delete bookings' }
  }

  try {
    await client.booking.delete({
      where: { id },
    })

    revalidatePath('/bookings')
    return { status: 200, message: 'Booking deleted successfully' }
  } catch (error) {
    console.error('Error deleting booking:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const approveBooking = async (id: string) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  if (!['aen', 'jen'].includes(currentUser.role)) {
    return { status: 403, message: 'Unauthorized to approve bookings' }
  }

  try {
    const updatedBooking = await client.booking.update({
      where: { id },
      data: {
        approved: true,
        status: 'approved'
      },
    })

    revalidatePath('/bookings')
    return { status: 200, message: 'Booking approved successfully', data: updatedBooking }
  } catch (error) {
    console.error('Error approving booking:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const disapproveBooking = async (id: string) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  if (!['aen', 'jen'].includes(currentUser.role)) {
    return { status: 403, message: 'Unauthorized to disapprove bookings' }
  }

  try {
    const updatedBooking = await client.booking.update({
      where: { id },
      data: {
        approved: false,
        status: 'disapproved'
      },
    })

    revalidatePath('/bookings')
    return { status: 200, message: 'Booking disapproved successfully', data: updatedBooking }
  } catch (error) {
    console.error('Error disapproving booking:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const getVendors = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return { status: 401, message: 'Unauthorized' }
  }

  try {
    let vendors

    switch (currentUser.role) {
      case 'contractor':
        vendors = await client.vendor.findMany({
          where: {
            jen: {
              contractor: {
                username: currentUser.username
              }
            }
          }
        })
        break

      case 'aen':
        vendors = await client.vendor.findMany({
          where: {
            jen: {
              aen: {
                username: currentUser.username
              }
            }
          }
        })
        break

      case 'jen':
        vendors = await client.vendor.findMany({
          where: {
            jen: { username: currentUser.username }
          }
        })
        break

      // default:
      //   throw new Error('Unauthorized to fetch vendors')
    }

    return { status: 200, data: vendors }
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const getVendorDetails = async (vendorId: string) => {
  try {
    const vendorDetails = await client.vendor.findUnique({
      where: { id: vendorId },
      include: {
        customers: true,
        vehicles: true,
        hydrants: true,
        destinations: true,
      },
    })

    if (!vendorDetails) {
      throw new Error('Vendor not found')
    }

    return { status: 200, data: vendorDetails }
  } catch (error) {
    console.error('Error fetching vendor details:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

// The getVendorDetails function now replaces the need for separate
// getCustomers, getVehicles, getHydrants, and getDestinations functions