'use server'

import { client } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

interface CustomerData {
  name: string;
  email?: string | null;
  contactNumber: string;
  address: string;
  type: 'government' | 'private';
  vendorId: string;
  approved?: boolean;
  active?: boolean;
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

export const getCustomers = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  try {
    let customers

    switch (currentUser.role) {
      case 'contractor':
        customers = await client.customer.findMany({
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
        customers = await client.customer.findMany({
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
        customers = await client.customer.findMany({
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
        throw new Error('Unauthorized to view customers')
    }

    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    return null
  }
}

export const addCustomer = async (data: CustomerData) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  try {
    let newCustomer

    switch (currentUser.role) {
      case 'contractor':
        // Contractor can add customers under all vendors in their circle
        const contractor = await client.contractor.findUnique({
          where: { username: currentUser.username },
          include: { circle: { include: { vendors: true } } },
        })

        if (!contractor) throw new Error('Contractor not found')

        const vendorInCircle = contractor.circle.vendors.find(v => v.id === data.vendorId)
        if (!vendorInCircle) throw new Error('Vendor not found in contractor\'s circle')

        newCustomer = await client.customer.create({
          data: {
            name: data.name,
            email: data.email,
            contactNumber: data.contactNumber,
            address: data.address,
            type: data.type,
            approved: data.approved ?? true,
            active: data.active ?? true,
            vendor: { connect: { id: data.vendorId } },
            jen: { connect: { id: vendorInCircle.jenId } },
          },
        })
        break

      case 'jen':
        // Jen can add customers only under their vendors
        const jen = await client.jen.findUnique({
          where: { username: currentUser.username },
          include: { vendors: true },
        })

        if (!jen) throw new Error('Jen not found')

        const vendorUnderJen = jen.vendors.find(v => v.id === data.vendorId)
        if (!vendorUnderJen) throw new Error('Vendor not found under this Jen')

        newCustomer = await client.customer.create({
          data: {
            name: data.name,
            email: data.email,
            contactNumber: data.contactNumber,
            address: data.address,
            type: data.type,
            approved: data.approved ?? true,
            active: data.active ?? true,
            vendor: { connect: { id: data.vendorId } },
            jen: { connect: { id: jen.id } },
          },
        })
        break

      default:
        throw new Error('Unauthorized to add customers')
    }

    revalidatePath('/customers')
    return { status: 200, message: 'Customer added successfully', data: newCustomer }
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error adding customer:', error)
      return { status: 500, message: error.message || 'Internal server error' }
    } else {
      console.error('Unknown error:', error)
      return { status: 500, message: 'Internal server error' }
    }
  }
}

export const updateCustomer = async (customerId: string, data: CustomerData) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  if (currentUser.role !== 'contractor') {
    return { status: 403, message: 'Only contractors can update customer details' }
  }

  try {
    const contractor = await client.contractor.findUnique({
      where: { username: currentUser.username },
      include: { circle: { include: { vendors: true } } },
    })

    if (!contractor) {
      throw new Error('Contractor not found')
    }

    const customer = await client.customer.findUnique({
      where: { id: customerId },
      include: { vendor: true },
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    // Check if the customer belongs to a vendor in the contractor's circle
    const vendorInCircle = contractor.circle.vendors.some(v => v.id === customer.vendor?.id)
    if (!vendorInCircle) {
      throw new Error('Customer does not belong to a vendor in your circle')
    }

    let updateData: any = {
      name: data.name,
      email: data.email,
      contactNumber: data.contactNumber,
      address: data.address,
      type: data.type,
      approved: data.approved,
      active: data.active,
    }

    if (data.vendorId) {
      const newVendor = contractor.circle.vendors.find(v => v.id === data.vendorId)
      if (!newVendor) {
        throw new Error('New vendor not found in your circle')
      }
      updateData.vendor = { connect: { id: data.vendorId } }
    }

    const updatedCustomer = await client.customer.update({
      where: { id: customerId },
      data: updateData,
    })

    revalidatePath('/customers')
    return { status: 200, message: 'Customer updated successfully', data: updatedCustomer }
  } catch (error) {
    console.error('Error updating customer:', error)
    if (error instanceof Error) {
      return { status: 500, message: error.message }
    }
    return { status: 500, message: 'Internal server error' }
  }
}

export const deleteCustomer = async (id: string) => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  try {
    const user = await client.user.findUnique({
      where: { id: currentUser.id },
    })

    if (!user) {
      throw new Error('User not found')
    }

    const customer = await client.customer.findUnique({
      where: { id },
      include: { vendor: true, jen: true },
    })

    if (!customer) {
      throw new Error('Customer not found')
    }

    if (currentUser.role === 'contractor') {
      // Only contractor can delete customers
      await client.customer.delete({
        where: { id },
      })
      revalidatePath('/customers')
      return { status: 200, message: 'Customer deleted successfully' }
    } else {
      throw new Error('Unauthorized to delete this customer')
    }
  } catch (error) {
    console.error('Error deleting customer:', error)
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
        const contractor = await client.contractor.findUnique({
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
        const jen = await client.jen.findUnique({
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