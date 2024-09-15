'use server'

import { client } from '@/lib/prisma'
import { clerkClient, currentUser } from '@clerk/nextjs'

export const onUpdatePassword = async (password: string) => {
  try {
    const user = await currentUser()
    if (!user) return { status: 401, message: 'Unauthorized' }

    const update = await clerkClient.users.updateUser(user.id, { password })
    if (update) {
      return { status: 200, message: 'Password updated' }
    }
    return { status: 400, message: 'Failed to update password' }
  } catch (error) {
    console.error('Error updating password:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const onDeleteUser = async () => {
  const user = await currentUser()
  if (!user) return { status: 401, message: 'Unauthorized' }

  try {
    const validUser = await client.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    })

    if (validUser) {
      await clerkClient.users.deleteUser(user.id)
      await client.user.delete({
        where: { id: validUser.id },
      })
      console.log(`User with ID ${user.id} deleted successfully.`)
      return { status: 200, message: 'User deleted successfully' }
    } else {
      return { status: 404, message: 'User not found' }
    }
  } catch (error) {
    console.error(`Error deleting user with ID ${user.id}:`, error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const getUserFullName = async () => {
  const user = await currentUser()
  if (!user) return null
  const validUser = await client.user.findUnique({
    where: { clerkId: user.id },
    select: { fullname: true },
  })
  return validUser?.fullname
}