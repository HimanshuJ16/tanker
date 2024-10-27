"use client"

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { useDestinations } from '@/hooks/destinations/use-destinations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getVendors } from '@/actions/destinations'
import { DestinationSchemaType } from '@/schemas/destination.schema'
import { getUserRole } from '@/actions/settings'

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "address", header: "Address" },
  { accessorKey: "latitude", header: "Latitude" },
  { accessorKey: "longitude", header: "Longitude" },
  { accessorKey: "vendor.username", header: "Vendor" },
  { accessorKey: "jen.username", header: "JEN" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: { approved: boolean; active: boolean; agree: boolean } } }) => {
      const { approved, active, agree } = row.original
      let status = "Inactive"
      if (approved && active && agree) status = "Active"
      else if (approved && !active) status = "Inactive"
      else if (!approved) status = "Pending"
      else if (!agree) status = "Disagreed"
      return <span>{status}</span>
    }
  },
]

export default function DestinationsPage() {
  const { destinations, onAddDestination, onUpdateDestination, onDeleteDestination } = useDestinations()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentDestination, setCurrentDestination] = useState<DestinationSchemaType | null>(null)
  const [formData, setFormData] = useState<DestinationSchemaType>({
    name: '',
    address: '',
    latitude: 0,
    longitude: 0,
    agree: false,
    active: false,
    approved: false,
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

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData({ ...formData, [name]: checked })
  }

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault()
    await onAddDestination(formData)
    setIsAddDialogOpen(false)
    setFormData({
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      agree: false,
      active: false,
      approved: false,
      vendorId: '',
    })
  }

  const handleUpdateDestination = async (e: React.FormEvent) => {
    e.preventDefault()
    if (currentDestination) {
      await onUpdateDestination(currentDestination.id!, formData)
    }
    setIsEditDialogOpen(false)
    setCurrentDestination(null)
    setFormData({
      name: '',
      address: '',
      latitude: 0,
      longitude: 0,
      agree: false,
      active: false,
      approved: false,
      vendorId: '',
    })
  }

  const handleDeleteDestination = async (destination: { id: string }) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      await onDeleteDestination(destination.id)
    }
  }

  const canEditDelete = userRole === 'contractor'
  const canAddDestination = userRole === 'contractor' || userRole === 'jen'

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Destinations</h1>
      <DataTable
        columns={columns}
        data={destinations}
        onAdd={canAddDestination ? () => setIsAddDialogOpen(true) : undefined}
        onEdit={canEditDelete ? (destination) => {
          setCurrentDestination(destination as DestinationSchemaType)
          setFormData(destination as DestinationSchemaType)
          setIsEditDialogOpen(true)
        } : undefined}
        onDelete={canEditDelete ? handleDeleteDestination : undefined}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Destination</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDestination} className="space-y-4">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
            <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
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
            <div className="flex items-center space-x-2">
              <Switch id="agree" checked={formData.agree} onCheckedChange={handleSwitchChange('agree')} />
              <label htmlFor="agree">Agree</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange('active')} />
              <label htmlFor="active">Active</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="approved" checked={formData.approved} onCheckedChange={handleSwitchChange('approved')} />
              <label htmlFor="approved">Approved</label>
            </div>
            <Button type="submit">Add Destination</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Destination</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDestination} className="space-y-4">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
            <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
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
            <div className="flex items-center space-x-2">
              <Switch id="agree" checked={formData.agree} onCheckedChange={handleSwitchChange('agree')} />
              <label htmlFor="agree">Agree</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange('active')} />
              <label htmlFor="active">Active</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="approved" checked={formData.approved} onCheckedChange={handleSwitchChange('approved')} />
              <label htmlFor="approved">Approved</label>
            </div>
            <Button type="submit">Update Destination</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}