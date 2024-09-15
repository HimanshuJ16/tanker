"use client"

import { useState } from 'react'
import { DataTable } from '@/components/ui/data-table'
import { useDrivers } from '@/hooks/drivers/use-drivers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const columns = [
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "licenseNumber",
    header: "License Number",
  },
  {
    accessorKey: "contactNumber",
    header: "Contact Number",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
]

export default function Component() {
  const { drivers, onAddDriver, onUpdateDriver, onDeleteDriver } = useDrivers()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentDriver, setCurrentDriver] = useState<{
    id: string;
    firstName: string;
    lastName: string;
    licenseNumber: string;
    contactNumber: string;
    status: string;
    userId: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    licenseNumber: '',
    contactNumber: '',
    status: 'active',
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStatusChange = (value: string) => {
    setFormData({ ...formData, status: value });
  };

  const handleAddDriver = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    await onAddDriver(formData)
    setIsAddDialogOpen(false)
    setFormData({ firstName: '', lastName: '', licenseNumber: '', contactNumber: '', status: 'active' })
  }

  const handleUpdateDriver = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (currentDriver) {
      await onUpdateDriver(currentDriver.id, formData)
    }
    setIsEditDialogOpen(false)
    setCurrentDriver(null)
    setFormData({ firstName: '', lastName: '', licenseNumber: '', contactNumber: '', status: 'active' })
  }

  const handleDeleteDriver = async (driver: { id: string }) => {
    if (window.confirm('Are you sure you want to delete this driver?')) {
      await onDeleteDriver(driver.id)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Drivers</h1>
      <DataTable
        columns={columns}
        data={drivers}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={(driver) => {
          setCurrentDriver(driver as { id: string; firstName: string; lastName: string; licenseNumber: string; contactNumber: string; status: string; userId: string; });
          setFormData(driver as { id: string; firstName: string; lastName: string; licenseNumber: string; contactNumber: string; status: string; userId: string; });
          setIsEditDialogOpen(true);
        }}
        onDelete={handleDeleteDriver}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Driver</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddDriver} className="space-y-4">
            <Input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
            <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
            <Input name="licenseNumber" placeholder="License Number" value={formData.licenseNumber} onChange={handleInputChange} required />
            <Input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required />
            <Select name="status" value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Add Driver</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Driver</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateDriver} className="space-y-4">
            <Input name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleInputChange} required />
            <Input name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleInputChange} required />
            <Input name="licenseNumber" placeholder="License Number" value={formData.licenseNumber} onChange={handleInputChange} required />
            <Input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required />
            <Select name="status" value={formData.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="on_leave">On Leave</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit">Update Driver</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}