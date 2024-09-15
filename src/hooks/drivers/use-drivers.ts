import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getDrivers, addDriver, updateDriver, deleteDriver } from '@/actions/drivers'
import { Driver } from '@prisma/client'

export const useDrivers = () => {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchDrivers = async () => {
    setLoading(true)
    const fetchedDrivers = await getDrivers()
    if (fetchedDrivers) {
      setDrivers(fetchedDrivers)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const onAddDriver = async (data: { firstName: string; lastName: string; licenseNumber: string; contactNumber: string; status: string }) => {
    setLoading(true)
    const result = await addDriver(data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchDrivers()
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  const onUpdateDriver = async (id: string, data: { firstName: string; lastName: string; licenseNumber: string; contactNumber: string; status: string }) => {
    setLoading(true)
    const result = await updateDriver(id, data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchDrivers()
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  const onDeleteDriver = async (id: string) => {
    setLoading(true)
    const result = await deleteDriver(id)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchDrivers()
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  return {
    drivers,
    loading,
    onAddDriver,
    onUpdateDriver,
    onDeleteDriver
  }
}