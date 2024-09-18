// components/TrackingComponent.tsx
'use client'

import { useEffect } from 'react'
import { useTracking } from '@/hooks/tracking/use-tracking'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Loader2, MapPin, PhoneCall } from "lucide-react"

// Fix for default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/leaflet/marker.svg',
  iconUrl: '/leaflet/marker.svg',
  shadowUrl: '/leaflet/marker-shadow.svg',
})

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap()
  useEffect(() => {
    map.setView(center)
  }, [center, map])
  return null
}

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
              <MapContainer 
                center={trackingData.currentLocation ? [trackingData.currentLocation.lat, trackingData.currentLocation.lng] : [0, 0]} 
                zoom={15} 
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {trackingData.currentLocation && (
                  <>
                    <Marker position={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]} />
                    <MapUpdater center={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]} />
                  </>
                )}
              </MapContainer>
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