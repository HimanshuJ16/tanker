// app/customers/page.tsx
"use client"

import { useState } from 'react'
import { DataTable } from './data-table'
import { useCustomers } from '@/hooks/customers/use-customers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'

const columns = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "contactNumber",
    header: "Contact Number",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: { approved: boolean; active: boolean } } }) => {
      const approved = row.original.approved
      const active = row.original.active
      let status = "Inactive"
      if (approved && active) status = "Active"
      else if (approved && !active) status = "Inactive"
      else if (!approved) status = "Pending"
      return <span>{status}</span>
    }
  },
]

export default function CustomersPage() {
  const { customers, onAddCustomer, onUpdateCustomer, onDeleteCustomer } = useCustomers()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<{
    id: string;
    name: string;
    email: string;
    contactNumber: string;
    address: string;
    approved: boolean;
    active: boolean;
    userId: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: '',
    approved: true,
    active: true,
  })
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSwitchChange = (name: string) => (checked: boolean) => {
    setFormData({ ...formData, [name]: checked });
  };

  const handleAddCustomer = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    await onAddCustomer(formData)
    setIsAddDialogOpen(false)
    setFormData({ name: '', email: '', contactNumber: '', address: '', approved: true, active: true })
  }

  const handleUpdateCustomer = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (currentCustomer) {
      await onUpdateCustomer(currentCustomer.id, formData)
    }
    setIsEditDialogOpen(false)
    setCurrentCustomer(null)
    setFormData({ name: '', email: '', contactNumber: '', address: '', approved: true, active: true })
  }

  const handleDeleteCustomer = async (customer: { id: string }) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      await onDeleteCustomer(customer.id)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      <DataTable
        columns={columns}
        data={customers}
        onAdd={() => setIsAddDialogOpen(true)}
        onEdit={(customer) => {
          setCurrentCustomer(customer as any);
          setFormData(customer as any);
          setIsEditDialogOpen(true);
        }}
        onDelete={handleDeleteCustomer}
      />

      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddCustomer} className="space-y-4">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
            <Input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} />
            <Input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required />
            <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
            <Button type="submit">Add Customer</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateCustomer} className="space-y-4">
            <Input name="name" placeholder="Name" value={formData.name} onChange={handleInputChange} required />
            <Input name="email" placeholder="Email" type="email" value={formData.email} onChange={handleInputChange} required />
            <Input name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleInputChange} required />
            <Input name="address" placeholder="Address" value={formData.address} onChange={handleInputChange} required />
            <div className="flex items-center space-x-2">
              <Switch id="approved" checked={formData.approved} onCheckedChange={handleSwitchChange('approved')} />
              <label htmlFor="approved">Approved</label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="active" checked={formData.active} onCheckedChange={handleSwitchChange('active')} />
              <label htmlFor="active">Active</label>
            </div>
            <Button type="submit">Update Customer</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}