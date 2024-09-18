// components/tracking/TrackingComponent.tsx
'use client'

import { useState, useEffect } from 'react'
import { useTracking } from '@/hooks/tracking/use-tracking'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, PhoneCall } from "lucide-react"
import dynamic from 'next/dynamic'

const TrackingMap = dynamic(() => import('./TrackingMap'), {
  ssr: false,
  loading: () => <div className="h-[400px] w-full flex items-center justify-center bg-gray-100">Loading map...</div>
})

export default function TrackingComponent() {
  const { 
    bookings, 
    selectedBooking, 
    setSelectedBooking, 
    trackingData, 
    loading, 
    error, 
    startTrackingTrip, 
    stopTracking 
  } = useTracking()

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <p className="text-red-500">Error: {error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full mt-[-2rem]">
      <CardHeader>
        <CardTitle>Vehicle Tracking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!trackingData ? (
          <>
            <Select value={selectedBooking || ''} onValueChange={setSelectedBooking}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a booking" />
              </SelectTrigger>
              <SelectContent>
                {bookings.map((booking) => (
                  <SelectItem key={booking.id} value={booking.id}>
                    {booking.vehicleNumber} - {booking.customerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={startTrackingTrip}
              disabled={!selectedBooking}
              className="w-full"
            >
              Start Tracking
            </Button>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <PhoneCall className="w-4 h-4" />
              <span>Driver Contact: {trackingData.driverContactNumber}</span>
            </div>
            <div className="h-[400px] w-full rounded-md overflow-hidden">
              {trackingData.currentLocation && (
                <TrackingMap 
                  center={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]}
                  zoom={15}
                />
              )}
            </div>
            {trackingData.currentLocation && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>
                  Current Location: {trackingData.currentLocation.lat.toFixed(6)}, {trackingData.currentLocation.lng.toFixed(6)}
                </span>
              </div>
            )}
            <Button 
              onClick={stopTracking}
              variant="destructive"
              className="w-full"
            >
              Stop Tracking
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  )
}