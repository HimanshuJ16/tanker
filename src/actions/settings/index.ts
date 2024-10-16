// app/actions/settings-actions.ts
'use server'

import { client } from '@/lib/prisma'
import { clerkClient, currentUser } from '@clerk/nextjs'

async function getUserWithDistrict() {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await client.user.findFirst({
    where: { 
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress
    },
    select: { id: true, district: true, email: true }
  })

  return dbUser
}

export const onUpdatePassword = async (password: string) => {
  try {
    const clerkUser = await currentUser()
    if (!clerkUser) return { status: 401, message: 'Unauthorized' }

    const update = await clerkClient.users.updateUser(clerkUser.id, { password })
    if (update) {
      return { status: 200, message: 'Password updated' }
    }
    return { status: 400, message: 'Failed to update password' }
  } catch (error) {
    console.error('Error updating password:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const onDeleteUser = async (district: string) => {
  const clerkUser = await currentUser()
  if (!clerkUser) return { status: 401, message: 'Unauthorized' }

  try {
    const dbUser = await client.user.findFirst({
      where: { 
        clerkId: clerkUser.id,
        email: clerkUser.emailAddresses[0].emailAddress,
        district: district
      },
      select: { id: true },
    })

    if (dbUser) {
      await client.user.delete({
        where: { id: dbUser.id },
      })

      // Check if this was the last account for this Clerk user
      const remainingAccounts = await client.user.count({
        where: { clerkId: clerkUser.id }
      })

      if (remainingAccounts === 0) {
        // If no more accounts exist, delete the Clerk user
        await clerkClient.users.deleteUser(clerkUser.id)
      }

      console.log(`User account in district ${district} deleted successfully.`)
      return { status: 200, message: 'User account deleted successfully' }
    } else {
      return { status: 404, message: 'User account not found in the specified district' }
    }
  } catch (error) {
    console.error(`Error deleting user account:`, error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const getUserFullName = async (district: string) => {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const dbUser = await client.user.findFirst({
    where: { 
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress,
      district: district
    },
    select: { fullname: true },
  })

  return dbUser?.fullname
}

export const getUserDistricts = async () => {
  const clerkUser = await currentUser()
  if (!clerkUser) return null

  const districts = await client.user.findMany({
    where: { 
      clerkId: clerkUser.id,
      email: clerkUser.emailAddresses[0].emailAddress
    },
    select: { district: true },
  })

  return districts.map(d => d.district)
}