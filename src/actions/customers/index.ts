// app/actions/customer-actions.ts
'use server'

import { client } from '@/lib/prisma'
import { currentUser } from '@clerk/nextjs'
import { revalidatePath } from 'next/cache'

export const getCustomers = async () => {
  const user = await currentUser()
  if (!user) return null

  try {
    const customers = await client.customer.findMany({
      where: {
        user: {
          clerkId: user.id
        }
      }
    })
    return customers
  } catch (error) {
    console.error('Error fetching customers:', error)
    return null
  }
}

export const addCustomer = async (data: {
  name: string
  email: string
  contactNumber: string
  address: string
}) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const validUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true }
    })

    if (!validUser) return { status: 404, message: 'User not found' }

    const newCustomer = await client.customer.create({
      data: {
        ...data,
        userId: validUser.id
      }
    })

    revalidatePath('/customers')
    return { status: 200, message: 'Customer added successfully', data: newCustomer }
  } catch (error) {
    console.error('Error adding customer:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const updateCustomer = async (id: string, data: {
  name: string
  email: string
  contactNumber: string
  address: string
  approved: boolean
  active: boolean
}) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const updatedCustomer = await client.customer.update({
      where: { id },
      data
    })

    revalidatePath('/customers')
    return { status: 200, message: 'Customer updated successfully', data: updatedCustomer }
  } catch (error) {
    console.error('Error updating customer:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const deleteCustomer = async (id: string) => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    await client.customer.delete({
      where: { id }
    })

    revalidatePath('/customers')
    return { status: 200, message: 'Customer deleted successfully' }
  } catch (error) {
    console.error('Error deleting customer:', error)
    return { status: 500, message: 'Internal server error' }
  }
}