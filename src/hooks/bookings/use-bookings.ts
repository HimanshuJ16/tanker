// // hooks/use-bookings.ts
// import { useState, useEffect } from 'react'
// import { useToast } from '@/hooks/use-toast'
// import { getBookings, addBooking, updateBooking, deleteBooking, getCustomersAndVehicles } from '@/actions/bookings'
// import { Booking, Customer, Vehicle } from '@prisma/client'

// export const useBookings = () => {
//   const [bookings, setBookings] = useState<Booking[]>([])
//   const [customers, setCustomers] = useState<Customer[]>([])
//   const [vehicles, setVehicles] = useState<Vehicle[]>([])
//   const [loading, setLoading] = useState(false)
//   const { toast } = useToast()

//   const fetchBookings = async () => {
//     setLoading(true)
//     const fetchedBookings = await getBookings()
//     if (fetchedBookings) {
//       setBookings(fetchedBookings)
//     }
//     setLoading(false)
//   }

//   const fetchCustomersAndVehicles = async () => {
//     setLoading(true)
//     const { customers, vehicles } = await getCustomersAndVehicles()
//     if (customers && vehicles) {
//       setCustomers(customers)
//       setVehicles(vehicles)
//     }
//     setLoading(false)
//   }

//   useEffect(() => {
//     fetchBookings()
//     fetchCustomersAndVehicles()
//   }, [])

//   const onAddBooking = async (data: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>) => {
//     setLoading(true)
//     const result = await addBooking(data)
//     if (result.status === 200) {
//       toast({ title: 'Success', description: result.message })
//       await fetchBookings()
//     } else {
//       toast({ title: 'Error', description: result.message })
//     }
//     setLoading(false)
//   }

//   const onUpdateBooking = async (id: string, data: Partial<Booking>) => {
//     setLoading(true)
//     const result = await updateBooking(id, data)
//     if (result.status === 200) {
//       toast({ title: 'Success', description: result.message })
//       await fetchBookings()
//     } else {
//       toast({ title: 'Error', description: result.message })
//     }
//     setLoading(false)
//   }

//   const onDeleteBooking = async (id: string) => {
//     setLoading(true)
//     const result = await deleteBooking(id)
//     if (result.status === 200) {
//       toast({ title: 'Success', description: result.message })
//       await fetchBookings()
//     } else {
//       toast({ title: 'Error', description: result.message })
//     }
//     setLoading(false)
//   }

//   return {
//     bookings,
//     customers,
//     vehicles,
//     loading,
//     onAddBooking,
//     onUpdateBooking,
//     onDeleteBooking
//   }
// }