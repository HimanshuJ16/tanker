'use server'

import { client } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

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

export const onUpdatePassword = async (oldPassword: string, newPassword: string) => {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return { status: 401, message: 'Unauthorized' }

    const user = await client.user.findUnique({
      where: { id: currentUser.id },
      select: { password: true }
    })

    if (!user) return { status: 404, message: 'User not found' }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isOldPasswordValid) return { status: 400, message: 'Invalid old password' }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10)
    await client.user.update({
      where: { id: currentUser.id },
      data: { password: hashedNewPassword }
    })

    return { status: 200, message: 'Password updated successfully' }
  } catch (error) {
    console.error('Error updating password:', error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const onDeleteUser = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { status: 401, message: 'Unauthorized' }

  try {
    await client.user.delete({
      where: { id: currentUser.id },
    })

    console.log(`User account deleted successfully.`)
    return { status: 200, message: 'User account deleted successfully' }
  } catch (error) {
    console.error(`Error deleting user account:`, error)
    return { status: 500, message: 'Internal server error' }
  }
}

export const getUserFullName = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  const dbUser = await client.user.findUnique({
    where: { id: currentUser.id },
    select: { fullname: true },
  })

  return dbUser?.fullname
}

export const getUserDistrict = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  return currentUser.district
}

export const getUserRole = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  return currentUser.role
}

export const getUserId = async () => {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null

  return currentUser.id
}