"use client"

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { useVehicles } from '@/hooks/vehicles/use-vehicles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getVendors } from '@/actions/vehicles'
import { VehicleSchemaType } from '@/schemas/vehicle.schema'
import { getUserRole } from '@/actions/settings'

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "address", header: "Address" },
  { accessorKey: "contactNumber", header: "Contact Number" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "vehicleNumber", header: "Vehicle Number" },
  { accessorKey: "vendor.username", header: "Vendor" },
  { accessorKey: "jen.username", header: "JEN" },
]

export default function VehiclesPage() {
  const { vehicles, onAddVehicle, onUpdateVehicle, onDeleteVehicle } = useVehicles()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<VehicleSchemaType | null>(null)
  const [formData, setFormData] = useState<VehicleSchemaType>({
    name: '',
    address: '',
    contactNumber: '',
    email: '',
    vehicleNumber: '',
    vendorId: '',
  })
  const [vendors, setVendors] = useState<{ id: string; name: string; username: string; }[]>([])
  const [userRole, setUserRole] = useState('')

  useEffect(() => {
    const fetchUserRoleAndVendors = async () => {
      const role = await getUserRole()
      setUserRole(role || '')

      const result = await getVendors()
      if (result.status === 200) {
        setVendors(result.data ?? [])
      } else {
        console.error('Error fetching vendors:', result.message)
      }
    }

    fetchUserRoleAndVendors()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAddVehicle(formData)
    setIsAddDialogOpen(false)
    setFormData({
      name: '',
      address: '',
      contactNumber: '',
      email: '',
      vehicleNumber: '',
      vendorId: '',
    })
  }

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentVehicle) {
      await onUpdateVehicle(currentVehicle.id!, formData)
    }
    setIsEditDialogOpen(false)
    setCurrentVehicle(null)
    setFormData({
      name: '',
      address: '',
      contactNumber: '',
      email: '',
      vehicleNumber: '',
      vendorId: '',
    })
  }

  const handleDeleteVehicle = async (vehicle: { id: string }) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      await onDeleteVehicle(vehicle.id)
    }
  }

  const canEditDelete = userRole === 'contractor'
  const canAddVehicle = userRole === 'contractor' || userRole === 'jen'

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vehicles</h1>
      <DataTable
        columns={columns}
        data={vehicles}
        onAdd={canAddVehicle ? () => setIsAddDialogOpen(true) : () => {}}
        onEdit={canEditDelete ? (vehicle) => {
          setCurrentVehicle(vehicle as VehicleSchemaType)
          setFormData(vehicle as VehicleSchemaType)
          setIsEditDialogOpen(true)
        } : undefined}
        onDelete={canEditDelete ? handleDeleteVehicle : undefined}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
            <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
            <Input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required />
            <Input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} required />
            <Input name="vehicleNumber" placeholder="Vehicle Number" value={formData.vehicleNumber} onChange={handleInputChange} required />
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
            <Button type="submit">Add Vehicle</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateVehicle} className="space-y-4">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
            <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
            <Input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required />
            <Input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} required />
            <Input name="vehicleNumber" placeholder="Vehicle Number" value={formData.vehicleNumber} onChange={handleInputChange} required />
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
            <Button type="submit">Update Vehicle</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}