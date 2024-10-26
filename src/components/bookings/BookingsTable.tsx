// // app/bookings/booking-table.tsx
// "use client"

// import { useState } from 'react'
// import { DataTable } from './data-table'
// import { useBookings } from '@/hooks/bookings/use-bookings'
// import { Button } from '@/components/ui/button'
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// import { ColumnDef } from '@tanstack/react-table'
// import { Booking } from '@prisma/client'

// const columns: ColumnDef<Booking>[] = [
//   {
//     accessorKey: "vehicleNumber",
//     header: "Vehicle Number",
//   },
//   {
//     accessorKey: "customerName",
//     header: "Customer Name",
//   },
//   {
//     accessorKey: "contactNumber",
//     header: "Contact Number",
//   },
//   {
//     accessorKey: "customerAddress",
//     header: "Address",
//   },
//   {
//     accessorKey: "createdAt",
//     header: "Created At",
//     cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
//   },
//   {
//     accessorKey: "status",
//     header: "Status",
//   },
// ]

// export default function BookingTable() {
//   const { bookings, customers, vehicles, onAddBooking, onUpdateBooking, onDeleteBooking } = useBookings()
//   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
//   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
//   const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
//   const [formData, setFormData] = useState({
//     customerId: '',
//     vehicleId: '',
//     status: 'pending',
//   })
  
//   const handleSelectChange = (name: string, value: string) => {
//     setFormData({ ...formData, [name]: value })
//   }

//   const handleAddBooking = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const customer = customers.find(c => c.id === formData.customerId)
//     const vehicle = vehicles.find(v => v.id === formData.vehicleId)
//     if (customer && vehicle) {
//       await onAddBooking({
//         ...formData,
//         customerName: customer.name,
//         customerAddress: customer.address || '',
//         contactNumber: customer.contactNumber || '',
//         vehicleNumber: vehicle.vehicleNumber,
//         userId: customer.userId || '',
//       })
//     }
//     setIsAddDialogOpen(false)
//     setFormData({ customerId: '', vehicleId: '', status: 'pending' })
//   }

//   const handleUpdateBooking = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (currentBooking) {
//       await onUpdateBooking(currentBooking.id, formData)
//     }
//     setIsEditDialogOpen(false)
//     setCurrentBooking(null)
//     setFormData({ customerId: '', vehicleId: '', status: 'pending' })
//   }

//   const handleDeleteBooking = async (booking: Booking) => {
//     if (window.confirm('Are you sure you want to delete this booking?')) {
//       await onDeleteBooking(booking.id)
//     }
//   }

//   return (
//     <div>
//       <h1 className="text-2xl font-bold mb-4">Bookings</h1>
//       <DataTable
//         columns={columns}
//         data={bookings}
//         onAdd={() => setIsAddDialogOpen(true)}
//         onEdit={(booking) => {
//           setCurrentBooking(booking as Booking)
//           setFormData({
//             customerId: booking.customerId,
//             vehicleId: booking.vehicleId,
//             status: booking.status,
//           })
//           setIsEditDialogOpen(true)
//         }}
//         onDelete={(booking) => handleDeleteBooking(booking as Booking)}
//       />

//       <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Add Booking</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleAddBooking} className="space-y-4">
//             <Select name="customerId" value={formData.customerId} onValueChange={(value) => handleSelectChange('customerId', value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select customer" />
//               </SelectTrigger>
//               <SelectContent>
//                 {customers.map((customer) => (
//                   <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select name="vehicleId" value={formData.vehicleId} onValueChange={(value) => handleSelectChange('vehicleId', value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select vehicle" />
//               </SelectTrigger>
//               <SelectContent>
//                 {vehicles.map((vehicle) => (
//                   <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.vehicleNumber}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="pending">Pending</SelectItem>
//                 <SelectItem value="confirmed">Confirmed</SelectItem>
//                 <SelectItem value="completed">Completed</SelectItem>
//                 <SelectItem value="cancelled">Cancelled</SelectItem>
//               </SelectContent>
//             </Select>
//             <Button type="submit">Add Booking</Button>
//           </form>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Edit Booking</DialogTitle>
//           </DialogHeader>
//           <form onSubmit={handleUpdateBooking} className="space-y-4">
//             <Select name="customerId" value={formData.customerId} onValueChange={(value) => handleSelectChange('customerId', value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select customer" />
//               </SelectTrigger>
//               <SelectContent>
//                 {customers.map((customer) => (
//                   <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select name="vehicleId" value={formData.vehicleId} onValueChange={(value) => handleSelectChange('vehicleId', value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select vehicle" />
//               </SelectTrigger>
//               <SelectContent>
//                 {vehicles.map((vehicle) => (
//                   <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.vehicleNumber}</SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//             <Select name="status" value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select status" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="pending">Pending</SelectItem>
//                 <SelectItem value="confirmed">Confirmed</SelectItem>
//                 <SelectItem value="completed">Completed</SelectItem>
//                 <SelectItem value="cancelled">Cancelled</SelectItem>
//               </SelectContent>
//             </Select>
//             <Button type="submit">Update Booking</Button>
//           </form>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }