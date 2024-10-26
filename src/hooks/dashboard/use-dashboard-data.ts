// // hooks/use-dashboard-data.ts
// import { useState, useEffect } from 'react'
// import { useToast } from '@/hooks/use-toast'
// import { getDashboardData } from '@/actions/dashboard'

// export interface DashboardData {
//   totalTrips: number
//   totalDrivers: number
//   totalCustomers: number
//   totalVehicles: number
//   monthlyTrips: { month: string; count: number }[]
// }

// export const useDashboardData = (startDate?: Date, endDate?: Date) => {
//   const [data, setData] = useState<DashboardData | null>(null)
//   const [loading, setLoading] = useState(false)
//   const { toast } = useToast()

//   const fetchDashboardData = async () => {
//     setLoading(true)
//     const result = await getDashboardData(startDate, endDate)
//     if (result.status === 200) {
//       setData(result.data ?? null)
//     } else {
//       toast({ title: 'Error', description: result.message })
//     }
//     setLoading(false)
//   }

//   useEffect(() => {
//     fetchDashboardData()
//   }, [startDate, endDate])

//   return { data, loading, refetch: fetchDashboardData }
// }