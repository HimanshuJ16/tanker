import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getCustomers, addCustomer, updateCustomer, deleteCustomer } from '@/actions/customers'
import { Customer } from '@prisma/client'
import { CustomerSchemaType } from '@/schemas/customer.schema'

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

  const onAddCustomer = async (data: CustomerSchemaType) => {
    setLoading(true)
    const result = await addCustomer(data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchCustomers()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const onUpdateCustomer = async (id: string, data: CustomerSchemaType) => {
    setLoading(true)
    const result = await updateCustomer(id, data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchCustomers()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
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
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
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