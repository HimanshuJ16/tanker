"use client"

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { useBookings } from '@/hooks/bookings/use-bookings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { getVendors, getVendorDetails } from '@/actions/bookings'
import { BookingSchemaType } from '@/schemas/booking.schema'
import { getUserRole } from '@/actions/settings'

const columns = [
  { accessorKey: "type", header: "Type" },
  { accessorKey: "bookingType", header: "Booking Type" },
  { accessorKey: "customer.name", header: "Customer Name" },
  { accessorKey: "vehicle.vehicleNumber", header: "Vehicle Number" },
  { accessorKey: "hydrant.name", header: "Hydrant Name" },
  { accessorKey: "destination.name", header: "Destination Name" },
  { accessorKey: "scheduledDateTime", header: "Scheduled Date Time" },
  { accessorKey: "vendor.username", header: "Vendor" },
  { accessorKey: "jen.username", header: "JEN" },
  { accessorKey: "status", header: "Status" },
]

export default function BookingsPage() {
  const { bookings, onAddBooking, onUpdateBooking, onDeleteBooking, onApproveBooking, onDisapproveBooking } = useBookings()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<BookingSchemaType | null>(null)
  const [formData, setFormData] = useState<BookingSchemaType>({
    type: 'normal',
    bookingType: 'regular',
    scheduledDateTime: new Date(),
    vendorId: '',
    customerId: '',
    vehicleId: '',
    hydrantId: '',
    destinationId: '',
  })
  // const [vendors, setVendors] = useState([])
  const [vendorDetails, setVendorDetails] = useState<any>(null)
  const [userRole, setUserRole] = useState('')
  const [date, setDate] = useState<Date>()
  const [vendors, setVendors] = useState<{ name: string; id: string; createdAt: Date; updatedAt: Date; jenId: string; username: string; district: string; circleId: string; }[]>([])

  useEffect(() => {
    const fetchUserRoleAndVendors = async () => {
      const role = await getUserRole()
      setUserRole(role || '')
  
      const vendorsResult = await getVendors()
      if (vendorsResult.status === 200) {
        setVendors(vendorsResult.data ?? [])
      }
    }
  
    fetchUserRoleAndVendors()
  }, [])
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value })
    if (name === 'vendorId') {
      fetchRelatedData(value)
    }
  }

  const fetchRelatedData = async (vendorId: string) => {
    const result = await getVendorDetails(vendorId)
    if (result.status === 200) {
      setVendorDetails(result.data)
    } else {
      console.error('Error fetching vendor details:', result.message)
    }
  }

  const handleAddBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAddBooking(formData)
    setIsAddDialogOpen(false)
    resetFormData()
  }

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentBooking) {
      await onUpdateBooking(currentBooking.id!, formData)
    }
    setIsEditDialogOpen(false)
    setCurrentBooking(null)
    resetFormData()
  }

  const handleDeleteBooking = async (booking: { id: string }) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      await onDeleteBooking(booking.id)
    }
  }

  const handleApproveBooking = async (booking: { id: string }) => {
    await onApproveBooking(booking.id)
  }

  const handleDisapproveBooking = async (booking: { id: string }) => {
    await onDisapproveBooking(booking.id)
  }

  const resetFormData = () => {
    setFormData({
      type: 'normal',
      bookingType: 'regular',
      scheduledDateTime: new Date(),
      vendorId: '',
      customerId: '',
      vehicleId: '',
      hydrantId: '',
      destinationId: '',
    })
    setDate(undefined)
  }

  const canEditDelete = ['contractor', 'aen', 'jen'].includes(userRole)
  const canApprove = ['aen', 'jen'].includes(userRole)

  return (
    <div>
      <DataTable
        columns={columns}
        data={bookings}
        onAdd={canEditDelete ? () => setIsAddDialogOpen(true) : undefined}
        onEdit={canEditDelete ? (booking) => {
          setCurrentBooking(booking as BookingSchemaType)
          setFormData(booking as BookingSchemaType)
          setIsEditDialogOpen(true)
        } : undefined}
        onDelete={canEditDelete ? handleDeleteBooking : undefined}
        onApprove={canApprove ? handleApproveBooking : undefined}
        onDisapprove={canApprove ? handleDisapproveBooking : undefined}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Booking</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddBooking} className="space-y-4">
            <Select name="type" value={formData.type} onValueChange={handleSelectChange('type')}>
              <SelectTrigger>
                <SelectValue placeholder="Select booking type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select name="bookingType" value={formData.bookingType} onValueChange={handleSelectChange('bookingType')}>
              <SelectTrigger>
                <SelectValue placeholder="Select booking type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            {formData.bookingType === 'scheduled' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate)
                      setFormData({ ...formData, scheduledDateTime: newDate || new Date() })
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            <Select name="vendorId" value={formData.vendorId} onValueChange={handleSelectChange('vendorId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="customerId" value={formData.customerId} onValueChange={handleSelectChange('customerId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {vendorDetails?.customers.map((customer: { id: string; name: string }) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="vehicleId" value={formData.vehicleId} onValueChange={handleSelectChange('vehicleId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vendorDetails?.vehicles.map((vehicle: { id: string; vehicleNumber: string }) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicleNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="hydrantId" value={formData.hydrantId} onValueChange={handleSelectChange('hydrantId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select hydrant" />
              </SelectTrigger>
              <SelectContent>
                {vendorDetails?.hydrants.map((hydrant: { id: string; name: string }) => (
                  <SelectItem key={hydrant.id} value={hydrant.id}>
                    {hydrant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="destinationId" value={formData.destinationId} onValueChange={handleSelectChange('destinationId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {vendorDetails?.destinations.map((destination: { id: string; name: string }) => (
                  <SelectItem key={destination.id} value={destination.id}>
                    {destination.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Add Booking</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Booking</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateBooking} className="space-y-4">
            <Select name="type" value={formData.type} onValueChange={handleSelectChange('type')}>
              <SelectTrigger>
                <SelectValue placeholder="Select booking type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
            <Select name="bookingType" value={formData.bookingType} onValueChange={handleSelectChange('bookingType')}>
              <SelectTrigger>
                <SelectValue placeholder="Select booking type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>
            {formData.bookingType === 'scheduled' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate)
                      setFormData({ ...formData, scheduledDateTime: newDate || new Date() })
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            )}
            <Select name="vendorId" value={formData.vendorId} onValueChange={handleSelectChange('vendorId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id}>
                    {vendor.name} - {vendor.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="customerId" value={formData.customerId} onValueChange={handleSelectChange('customerId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select customer" />
              </SelectTrigger>
              <SelectContent>
                {vendorDetails?.customers.map((customer: { id: string; name: string }) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="vehicleId" value={formData.vehicleId} onValueChange={handleSelectChange('vehicleId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vendorDetails?.vehicles.map((vehicle: { id: string; vehicleNumber: string }) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.vehicleNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="hydrantId" value={formData.hydrantId} onValueChange={handleSelectChange('hydrantId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select hydrant" />
              </SelectTrigger>
              <SelectContent>
                {vendorDetails?.hydrants.map((hydrant: { id: string; name: string }) => (
                  <SelectItem key={hydrant.id} value={hydrant.id}>
                
                    {hydrant.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select name="destinationId" value={formData.destinationId} onValueChange={handleSelectChange('destinationId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination" />
              </SelectTrigger>
              <SelectContent>
                {vendorDetails?.destinations.map((destination: { id: string; name: string }) => (
                  <SelectItem key={destination.id} value={destination.id}>
                    {destination.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Update Booking</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}