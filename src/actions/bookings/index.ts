// // app/actions/booking-actions.ts
// 'use server'

// import { client } from '@/lib/prisma'
// import { currentUser } from '@clerk/nextjs'
// import { revalidatePath } from 'next/cache'
// import { Booking } from '@prisma/client'

// export const getBookings = async () => {
//   const user = await currentUser()
//   if (!user) return null

//   try {
//     const bookings = await client.booking.findMany({
//       where: {
//         user: {
//           clerkId: user.id
//         }
//       },
//       include: {
//         customer: true,
//         vehicle: true
//       }
//     })
//     return bookings
//   } catch (error) {
//     console.error('Error fetching bookings:', error)
//     return null
//   }
// }

// export const getCustomersAndVehicles = async () => {
//   const user = await currentUser()
//   if (!user) return { customers: null, vehicles: null }

//   try {
//     const customers = await client.customer.findMany({
//       where: {
//         user: {
//           clerkId: user.id
//         }
//       }
//     })
//     const vehicles = await client.vehicle.findMany({
//       where: {
//         user: {
//           clerkId: user.id
//         }
//       }
//     })
//     return { customers, vehicles }
//   } catch (error) {
//     console.error('Error fetching customers and vehicles:', error)
//     return { customers: null, vehicles: null }
//   }
// }

// export const addBooking = async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
//   const user = await currentUser()
//   if (!user) return { status: 401, message: 'Unauthorized' }

//   try {
//     const validUser = await client.user.findUnique({
//       where: { clerkId: user.id },
//       select: { id: true }
//     })

//     if (!validUser) return { status: 404, message: 'User not found' }

//     const newBooking = await client.booking.create({
//       data: {
//         ...data,
//         userId: validUser.id
//       }
//     })

//     revalidatePath('/bookings')
//     return { status: 200, message: 'Booking added successfully', data: newBooking }
//   } catch (error) {
//     console.error('Error adding booking:', error)
//     return { status: 500, message: 'Internal server error' }
//   }
// }

// export const updateBooking = async (id: string, data: Partial<Booking>) => {
//   const user = await currentUser()
//   if (!user) return { status: 401, message: 'Unauthorized' }

//   try {
//     const updatedBooking = await client.booking.update({
//       where: { id },
//       data
//     })

//     revalidatePath('/bookings')
//     return { status: 200, message: 'Booking updated successfully', data: updatedBooking }
//   } catch (error) {
//     console.error('Error updating booking:', error)
//     return { status: 500, message: 'Internal server error' }
//   }
// }

// export const deleteBooking = async (id: string) => {
//   const user = await currentUser()
//   if (!user) return { status: 401, message: 'Unauthorized' }

//   try {
//     await client.booking.delete({
//       where: { id }
//     })

//     revalidatePath('/bookings')
//     return { status: 200, message: 'Booking deleted successfully' }
//   } catch (error) {
//     console.error('Error deleting booking:', error)
//     return { status: 500, message: 'Internal server error' }
//   }
// }