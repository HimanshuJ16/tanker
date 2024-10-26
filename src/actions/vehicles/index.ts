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

interface VehicleData {
  name: string;
  address: string;
  contactNumber: string;
  email: string;
  vehicleNumber: string;
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

export const getVehicles = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  try {
    let vehicles

    switch (currentUser.role) {
      case 'contractor':
        vehicles = await prisma.vehicle.findMany({
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
        vehicles = await prisma.vehicle.findMany({
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
        vehicles = await prisma.vehicle.findMany({
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
        throw new Error('Unauthorized to view vehicles')
    }

    return vehicles
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return null
  }
}

export const addVehicle = async (data: VehicleData) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  try {
    let newVehicle

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

        newVehicle = await prisma.vehicle.create({
          data: {
            name: data.name,
            address: data.address,
            contactNumber: data.contactNumber,
            email: data.email,
            vehicleNumber: data.vehicleNumber,
            vendor: { connect: { id: data.vendorId } },
            jen: { connect: { id: currentUser.role === 'jen' ? user.id : vendorInCircle.jenId } },
          },
        })
        break

      default:
        throw new Error('Unauthorized to add vehicles')
    }

    revalidatePath('/vehicles')
    return { status: 200, message: 'Vehicle added successfully', data: newVehicle }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error adding vehicle:', error)
      return { status: 500, message: error.message || 'Internal server error' }
    } else {
      console.error('Unknown error:', error)
      return { status: 500, message: 'Internal server error' }
    }
  }
}

export const updateVehicle = async (vehicleId: string, data: VehicleData) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  if (currentUser.role !== 'contractor') 
    return { status: 403, message: 'Only contractors can update vehicle details' }

  try {
    const contractor = await prisma.contractor.findUnique({
      where: { username: currentUser.username },
      include: { circle: { include: { vendors: true } } },
    })

    if (!contractor) throw new Error('Contractor not found')

    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: { vendor: true },
    })

    if (!vehicle) throw new Error('Vehicle not found')

    const vendorInCircle = contractor.circle.vendors.some(v => v.id === vehicle.vendor?.id)
    if (!vendorInCircle) throw new Error('Vehicle does not belong to a vendor in your circle')

    const updateData: any = {
      name: data.name,
      address: data.address,
      contactNumber: data.contactNumber,
      email: data.email,
      vehicleNumber: data.vehicleNumber,
    }

    if (data.vendorId) {
      const newVendor = contractor.circle.vendors.find(v => v.id === data.vendorId)
      if (!newVendor) throw new Error('New vendor not found in your circle')
      updateData.vendor = { connect: { id: data.vendorId } }
    }

    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: updateData,
    })

    revalidatePath('/vehicles')
    return { status: 200, message: 'Vehicle updated successfully', data: updatedVehicle }
  } catch (error) {
    console.error('Error updating vehicle:', error)
    if (error instanceof Error) {
      return { status: 500, message: error.message }
    }
    return { status: 500, message: 'Internal server error' }
  }
}

export const deleteVehicle = async (id: string) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  try {
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
    })

    if (!user) throw new Error('User not found')

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: { vendor: true, jen: true },
    })

    if (!vehicle) throw new Error('Vehicle not found')

    if (currentUser.role === 'contractor') {
      await prisma.vehicle.delete({
        where: { id },
      })
      revalidatePath('/vehicles')
      return { status: 200, message: 'Vehicle deleted successfully' }
    } else {
      throw new Error('Unauthorized to delete this vehicle')
    }
  } catch (error) {
    console.error('Error deleting vehicle:', error)
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