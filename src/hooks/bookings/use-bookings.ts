import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getBookings, addBooking, updateBooking, deleteBooking, approveBooking, disapproveBooking } from '@/actions/bookings'
import { Booking } from '@prisma/client'
import { BookingSchemaType } from '@/schemas/booking.schema'

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchBookings = async () => {
    setLoading(true)
    const fetchedBookings = await getBookings()
    if (fetchedBookings) {
      setBookings(fetchedBookings)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const onAddBooking = async (data: BookingSchemaType) => {
    setLoading(true)
    const result = await addBooking(data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchBookings()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const onUpdateBooking = async (id: string, data: BookingSchemaType) => {
    setLoading(true)
    const result = await updateBooking(id, data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchBookings()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const onDeleteBooking = async (id: string) => {
    setLoading(true)
    const result = await deleteBooking(id)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchBookings()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const onApproveBooking = async (id: string) => {
    setLoading(true)
    const result = await approveBooking(id)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchBookings()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const onDisapproveBooking = async (id: string) => {
    setLoading(true)
    const result = await disapproveBooking(id)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchBookings()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  return {
    bookings,
    loading,
    onAddBooking,
    onUpdateBooking,
    onDeleteBooking,
    onApproveBooking,
    onDisapproveBooking
  }
}