'use server'

import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

const prisma = new PrismaClient()

interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

interface DestinationData {
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  latitude: number;
  longitude: number;
  agree: boolean;
  active: boolean;
  approved: boolean;
  vendorId: string;
}

async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  if (!token) return null

  try {
    const decoded = verify(token, process.env.JWT_SECRET!) as JwtPayload
    
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, district: true, username: true, role: true }
    })

    return dbUser
  } catch (error) {
    console.error('Error verifying token:', error)
    return null
  }
}

export const getDestinations = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  try {
    let destinations

    

    switch (currentUser.role) {
      case 'contractor':
        destinations = await prisma.destination.findMany({
          where: {
            jen: {
              contractor: {
                username: currentUser.username
              }
            }
          },
          include: {
            vendor: true,
            jen: true
          }
        })
        break

      case 'jen':
        destinations = await prisma.destination.findMany({
          where: {
            OR: [
              { jen: { username: currentUser.username } },
              { vendor: { jen: { username: currentUser.username } } }
            ]
          },
          include: {
            vendor: true,
            jen: true
          }
        })
        break

      case 'vendor':
        destinations = await prisma.destination.findMany({
          where: {
            vendor: { username: currentUser.username }
          },
          include: {
            vendor: true,
            jen: true
          }
        })
        break

      default:
        throw new Error('Unauthorized to view destinations')
    }

    return destinations
  } catch (error) {
    console.error('Error fetching destinations:', error)
    return null
  }
}

export const addDestination = async (data: DestinationData) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  try {
    let newDestination

    switch (currentUser.role) {
      case 'contractor':
      case 'jen':
        const user = await (prisma[currentUser.role] as any).findUnique({
          where: { username: currentUser.username },
          include: { circle: { include: { vendors: true } } },
        })

        if (!user) throw new Error(`${currentUser.role.toUpperCase()} not found`)

        const vendorInCircle = user.circle.vendors.find((v: any) => v.id === data.vendorId)
        if (!vendorInCircle) throw new Error('Vendor not found in user\'s circle')

        newDestination = await prisma.destination.create({
          data: {
            name: data.name,
            address: data.address,
            contactNumber: data.contactNumber,
            email: data.email,
            latitude: data.latitude,
            longitude: data.longitude,
            agree: data.agree,
            active: data.active,
            approved: data.approved,
            vendor: { connect: { id: data.vendorId } },
            jen: { connect: { id: currentUser.role === 'jen' ? user.id : vendorInCircle.jenId } },
          },
        })
        break

      default:
        throw new Error('Unauthorized to add destinations')
    }

    revalidatePath('/destinations')
    return { status: 200, message: 'Destination added successfully', data: newDestination }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error adding destination:', error)
      return { status: 500, message: error.message || 'Internal server error' }
    } else {
      console.error('Unknown error:', error)
      return { status: 500, message: 'Internal server error' }
    }
  }
}

export const updateDestination = async (destinationId: string, data: DestinationData) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  if (currentUser.role !== 'contractor') 
    return { status: 403, message: 'Only contractors can update destination details' }

  try {
    const contractor = await prisma.contractor.findUnique({
      where: { username: currentUser.username },
      include: { circle: { include: { vendors: true } } },
    })

    if (!contractor) throw new Error('Contractor not found')

    const destination = await prisma.destination.findUnique({
      where: { id: destinationId },
      include: { vendor: true },
    })

    if (!destination) throw new Error('Destination not found')

    const vendorInCircle = contractor.circle.vendors.some(v => v.id === destination.vendor?.id)
    if (!vendorInCircle) throw new Error('Destination does not belong to a vendor in your circle')

    const updateData: any = {
      name: data.name,
      address: data.address,
      contactNumber: data.contactNumber,
      email: data.email,
      latitude: data.latitude,
      longitude: data.longitude,
      agree: data.agree,
      active: data.active,
      approved: data.approved,
    }

    if (data.vendorId) {
      const newVendor = contractor.circle.vendors.find(v => v.id === data.vendorId)
      if (!newVendor) throw new Error('New vendor not found in your circle')
      updateData.vendor = { connect: { id: data.vendorId } }
    }

    const updatedDestination = await prisma.destination.update({
      where: { id: destinationId },
      data: updateData,
    })

    revalidatePath('/destinations')
    return { status: 200, message: 'Destination updated successfully', data: updatedDestination }
  } catch (error) {
    console.error('Error updating destination:', error)
    if (error instanceof Error) {
      return { status: 500, message: error.message }
    }
    return { status: 500, message: 'Internal server error' }
  }
}

export const deleteDestination = async (id: string) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    })

    if (!user) throw new Error('User not found')

    const destination = await prisma.destination.findUnique({
      where: { id },
      include: { vendor: true, jen: true },
    })

    if (!destination) throw new Error('Destination not found')

    if (currentUser.role === 'contractor') {
      await prisma.destination.delete({
        where: { id },
      })
      revalidatePath('/destinations')
      return { status: 200, message: 'Destination deleted successfully' }
    } else {
      throw new Error('Unauthorized to delete this destination')
    }
  } catch (error) {
    console.error('Error deleting destination:', error)
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
        const contractor = await prisma.contractor.findUnique({
          where: { username: currentUser.username },
          include: { circle: { include: { vendors: true } } },
        })

        if (!contractor) {
          throw new Error('Contractor not found')
        }

        vendors = contractor.circle.vendors.map(vendor => ({
          id: vendor.id,
          name: vendor.name,
          username: vendor.username
        }))
        break

      case 'jen':
        const jen = await prisma.jen.findUnique({
          where: { username: currentUser.username },
          include: { vendors: true },
        })

        if (!jen) {
          throw new Error('JEN not found')
        }

        vendors = jen.vendors.map(vendor => ({
          id: vendor.id,
          name: vendor.name,
          username: vendor.username
        }))
        break

      default:
        throw new Error('Unauthorized to fetch vendors')
    }

    return { status: 200, data: vendors }
  } catch (error) {
    console.error('Error fetching vendors:', error)
    return { status: 500, message: 'Internal server error' }
  }
}