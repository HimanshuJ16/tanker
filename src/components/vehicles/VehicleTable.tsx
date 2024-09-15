// app/vehicles/page.tsx
"use client"

import { useState } from 'react'
import { DataTable } from './data-table'
import { useVehicles } from '@/hooks/vehicles/use-vehicles'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const columns = [
  {
    accessorKey: "vehicleNumber",
    header: "Vehicle Number",
  },
  {
    accessorKey: "driver.firstName",
    header: "Driver First Name",
  },
  {
    accessorKey: "driver.lastName",
    header: "Driver Last Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }: { row: { getValue: (key: string) => any } }) => {
      return new Date(row.getValue("createdAt")).toLocaleString()
    },
  },
]

export default function VehiclesPage() {
  const { vehicles, drivers, onAddVehicle, onUpdateVehicle, onDeleteVehicle } = useVehicles()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentVehicle, setCurrentVehicle] = useState<{
    id: string;
    vehicleNumber: string;
    driverId: string | null;
  } | null>(null);
  const [formData, setFormData] = useState({
    vehicleNumber: '',
    driverId: '',
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, driverId: value });
  };

  const handleAddVehicle = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    await onAddVehicle(formData)
    setIsAddDialogOpen(false)
    setFormData({ vehicleNumber: '', driverId: '' })
  }

  const handleUpdateVehicle = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (currentVehicle) {
      await onUpdateVehicle(currentVehicle.id, formData)
    }
    setIsEditDialogOpen(false)
    setCurrentVehicle(null)
    setFormData({ vehicleNumber: '', driverId: '' })
  }

  const handleDeleteVehicle = async (vehicle: { id: string }) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      await onDeleteVehicle(vehicle.id)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Vehicles</h1>
      <DataTable
        columns={columns}
        data={vehicles}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={(vehicle) => {
          setCurrentVehicle(vehicle as { id: string; vehicleNumber: string; driverId: string | null });
          setFormData({ vehicleNumber: vehicle.vehicleNumber, driverId: vehicle.driverId || '' });
          setIsEditDialogOpen(true);
        }}
        onDelete={handleDeleteVehicle}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Vehicle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <Input name="vehicleNumber" placeholder="Vehicle Number" value={formData.vehicleNumber} onChange={handleInputChange} required />
            <Select name="driverId" onValueChange={handleSelectChange} value={formData.driverId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {`${driver.firstName} ${driver.lastName}`}
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
            <Input name="vehicleNumber" placeholder="Vehicle Number" value={formData.vehicleNumber} onChange={handleInputChange} required />
            <Select name="driverId" onValueChange={handleSelectChange} value={formData.driverId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {`${driver.firstName} ${driver.lastName}`}
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