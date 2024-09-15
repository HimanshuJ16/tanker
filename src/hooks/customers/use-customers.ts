// hooks/use-customers.ts
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/actions/customers'
import { Customer } from '@prisma/client'

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchCustomers = async () => {
    setLoading(true)
    const fetchedCustomers = await getCustomers()
    if (fetchedCustomers) {
      setCustomers(fetchedCustomers)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const onAddCustomer = async (data: { name: string; email: string; contactNumber: string; address: string }) => {
    setLoading(true)
    const result = await addCustomer(data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchCustomers()
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  const onUpdateCustomer = async (id: string, data: { name: string; email: string; contactNumber: string; address: string; approved: boolean; active: boolean }) => {
    setLoading(true)
    const result = await updateCustomer(id, data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchCustomers()
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  const onDeleteCustomer = async (id: string) => {
    setLoading(true)
    const result = await deleteCustomer(id)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchCustomers()
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  return {
    customers,
    loading,
    onAddCustomer,
    onUpdateCustomer,
    onDeleteCustomer
  }
}