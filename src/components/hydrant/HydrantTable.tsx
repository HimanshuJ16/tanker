"use client"

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { useHydrants } from '@/hooks/hydrants/use-hydrants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getVendors } from '@/actions/hydrant'
import { HydrantSchemaType } from '@/schemas/hydrant.schema'
import { getUserRole } from '@/actions/settings'

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "address", header: "Address" },
  { accessorKey: "contactNumber", header: "Contact Number" },
  { accessorKey: "email", header: "Email" },
  { accessorKey: "latitude", header: "Latitude" },
  { accessorKey: "longitude", header: "Longitude" },
  { accessorKey: "vendor.username", header: "Vendor" },
  { accessorKey: "jen.username", header: "JEN" },
]

export default function HydrantsPage() {
  const { hydrants, onAddHydrant, onUpdateHydrant, onDeleteHydrant } = useHydrants()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentHydrant, setCurrentHydrant] = useState<HydrantSchemaType | null>(null)
  const [formData, setFormData] = useState<HydrantSchemaType>({
    name: '',
    address: '',
    contactNumber: '',
    email: '',
    latitude: 0,
    longitude: 0,
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
    const value = e.target.name === 'latitude' || e.target.name === 'longitude'
      ? parseFloat(e.target.value)
      : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSelectChange = (name: string) => (value: string) => {
    setFormData({ ...formData, [name]: value })
  }

  const handleAddHydrant = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAddHydrant(formData)
    setIsAddDialogOpen(false)
    setFormData({
      name: '',
      address: '',
      contactNumber: '',
      email: '',
      latitude: 0,
      longitude: 0,
      vendorId: '',
    })
  }

  const handleUpdateHydrant = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentHydrant) {
      await onUpdateHydrant(currentHydrant.id!, formData)
    }
    setIsEditDialogOpen(false)
    setCurrentHydrant(null)
    setFormData({
      name: '',
      address: '',
      contactNumber: '',
      email: '',
      latitude: 0,
      longitude: 0,
      vendorId: '',
    })
  }

  const handleDeleteHydrant = async (hydrant: { id: string }) => {
    if (window.confirm('Are you sure you want to delete this hydrant?')) {
      await onDeleteHydrant(hydrant.id)
    }
  }

  const canEditDelete = userRole === 'contractor'
  const canAddHydrant = userRole === 'contractor' || userRole === 'jen'

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Hydrants</h1>
      <DataTable
        columns={columns}
        data={hydrants}
        onAdd={canAddHydrant ? () => setIsAddDialogOpen(true) : undefined}
        onEdit={canEditDelete ? (hydrant) => {
          setCurrentHydrant(hydrant as HydrantSchemaType)
          setFormData(hydrant as HydrantSchemaType)
          setIsEditDialogOpen(true)
        } : undefined}
        onDelete={canEditDelete ? handleDeleteHydrant : undefined}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Hydrant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddHydrant} className="space-y-4">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
            <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
            <Input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required />
            <Input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} required />
            <Input name="latitude" placeholder="Latitude" type="number" value={formData.latitude} onChange={handleInputChange} required />
            <Input name="longitude" placeholder="Longitude" type="number" value={formData.longitude} onChange={handleInputChange} required />
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
            <Button type="submit">Add Hydrant</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hydrant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateHydrant} className="space-y-4">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
            <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
            <Input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required />
            <Input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} required />
            <Input name="latitude" placeholder="Latitude" type="number" value={formData.latitude} onChange={handleInputChange} required />
            <Input name="longitude" placeholder="Longitude" type="number" value={formData.longitude} onChange={handleInputChange} required />
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
            <Button type="submit">Update Hydrant</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}