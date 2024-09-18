// hooks/use-tracking.ts
import { useState, useEffect, useRef } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getConfirmedBookings, startTracking, getDriverLocation, endTracking } from '@/actions/tracking'

interface BookingData {
  id: string
  vehicleNumber: string
  customerName: string
  vehicle: {
    driver: {
      contactNumber: string
    } | null
  } | null
}

interface TrackingData {
  tripId: string
  driverContactNumber: string
  currentLocation: { lat: number; lng: number } | null
}

export const useTracking = () => {
  const [bookings, setBookings] = useState<BookingData[]>([])
  const [selectedBooking, setSelectedBooking] = useState<string | null>(null)
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const locationInterval = useRef<NodeJS.Timeout | null>(null)

  const fetchBookings = async () => {
    setLoading(true)
    setError(null)
    const result = await getConfirmedBookings()
    if (result.status === 200 && result.data) {
      setBookings(result.data)
    } else {
      setError(result.message ?? null)
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const startTrackingTrip = async () => {
    if (!selectedBooking) {
      toast({ title: 'Error', description: 'Please select a booking to track', variant: 'destructive' })
      return
    }

    setLoading(true)
    setError(null)
    const result = await startTracking(selectedBooking)
    if (result.status === 200 && result.data) {
      setTrackingData({
        tripId: result.data.tripId,
        driverContactNumber: result.data.driverContactNumber,
        currentLocation: null
      })
      startFetchingDriverLocation(result.data.driverContactNumber)
      toast({ title: 'Success', description: 'Tracking started successfully' })
    } else {
      setError(result.message ?? null)
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const startFetchingDriverLocation = (driverContactNumber: string) => {
    locationInterval.current = setInterval(async () => {
      const result = await getDriverLocation(driverContactNumber)
      if (result.status === 200) {
        setTrackingData(prev => prev ? { ...prev, currentLocation: result.data ?? null } : null)      } else {
        console.error('Error fetching driver location:', result.message)
      }
    }, 5000) // Fetch every 5 seconds
  }

  const stopTracking = async () => {
    if (trackingData) {
      setLoading(true)
      setError(null)
      if (locationInterval.current) {
        clearInterval(locationInterval.current)
      }
      const result = await endTracking(trackingData.tripId)
      if (result.status === 200) {
        setTrackingData(null)
        setSelectedBooking(null)
        toast({ title: 'Success', description: 'Tracking ended successfully' })
      } else {
        setError(result.message ?? null)
        toast({ title: 'Error', description: result.message, variant: 'destructive' })
      }
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
    return () => {
      if (locationInterval.current) {
        clearInterval(locationInterval.current)
      }
    }
  }, [])

  return { 
    bookings, 
    selectedBooking, 
    setSelectedBooking, 
    trackingData, 
    loading, 
    error, 
    startTrackingTrip, 
    stopTracking 
  }
}