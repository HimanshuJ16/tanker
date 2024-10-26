// // app/dashboard/page.tsx
// 'use client'

// import { useState } from 'react'
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
// import { Button } from '@/components/ui/button'
// import { Calendar } from '@/components/ui/calendar'
// import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
// import { format } from 'date-fns'
// import { useDashboardData } from '@/hooks/dashboard/use-dashboard-data'
// import { CalendarIcon, TruckIcon, UserIcon, UsersIcon, CarIcon } from 'lucide-react'
// import { DateRange } from 'react-day-picker'

// export default function DashboardPage() {
//   const [startDate, setStartDate] = useState<Date | undefined>(undefined)
//   const [endDate, setEndDate] = useState<Date | undefined>(undefined)
//   const { data, loading } = useDashboardData(startDate, endDate)

//   const handleDateSelect = (range: DateRange | undefined) => {
//     if (range) {
//       setStartDate(range.from)
//       setEndDate(range.to)
//     } else {
//       setStartDate(undefined)
//       setEndDate(undefined)
//     }
//   }

//   const resetDateFilter = () => {
//     setStartDate(undefined)
//     setEndDate(undefined)
//   }

//   return (
//     <div className="container mx-auto">   
//       <div className="mb-6 flex justify-between items-center">
//         <Popover>
//           <PopoverTrigger asChild>
//             <Button variant="outline">
//               <CalendarIcon className="mr-2 h-4 w-4" />
//               {startDate && endDate
//                 ? `${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`
//                 : 'Select date range'}
//             </Button>
//           </PopoverTrigger>
//           <PopoverContent className="w-auto p-0" align="start">
//             <Calendar
//               mode="range"
//               selected={{ from: startDate, to: endDate }}
//               onSelect={handleDateSelect}
//               numberOfMonths={2}
//             />
//           </PopoverContent>
//         </Popover>
//         <Button onClick={resetDateFilter}>Reset Filter</Button>
//       </div>

//       {loading ? (
//         <div>Loading...</div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
//                 <TruckIcon className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{data?.totalTrips}</div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
//                 <UserIcon className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{data?.totalDrivers}</div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
//                 <UsersIcon className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{data?.totalCustomers}</div>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
//                 <CarIcon className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{data?.totalVehicles}</div>
//               </CardContent>
//             </Card>
//           </div>

//           <Card className="mb-8">
//             <CardHeader>
//               <CardTitle>Monthly Trips</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="h-[300px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart data={data?.monthlyTrips}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="count" fill="#8884d8" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </CardContent>
//           </Card>
//         </>
//       )}
//     </div>
//   )
// }