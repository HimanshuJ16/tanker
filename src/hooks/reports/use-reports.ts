// hooks/use-trips-report.ts
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getTripsReport } from '@/actions/reports'

export interface TripReportData {
  id: string
  startTime: Date | null
  endTime: Date | null
  distance: number | null
  status: string
  vehicleNumber: string
  driverName: string
  customerName: string
}

export const useTripsReport = (startDate?: Date, endDate?: Date) => {
  const [data, setData] = useState<TripReportData[] | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchTripsReport = async () => {
    setLoading(true)
    const result = await getTripsReport(startDate, endDate)
    if (result.status === 200) {
      setData(result.data ?? null)
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchTripsReport()
  }, [startDate, endDate])

  return { data, loading, refetch: fetchTripsReport }
}