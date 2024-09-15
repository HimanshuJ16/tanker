// hooks/use-vehicles.ts
import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getVehicles, addVehicle, updateVehicle, deleteVehicle, getDrivers } from '@/actions/vehicles'
import { Vehicle, Driver } from '@prisma/client'

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchVehicles = async () => {
    setLoading(true)
    const fetchedVehicles = await getVehicles()
    if (fetchedVehicles) {
      setVehicles(fetchedVehicles)
    }
    setLoading(false)
  }

  const fetchDrivers = async () => {
    const fetchedDrivers = await getDrivers()
    if (fetchedDrivers) {
      setDrivers(fetchedDrivers)
    }
  }

  useEffect(() => {
    fetchVehicles()
    fetchDrivers()
  }, [])

  const onAddVehicle = async (data: { vehicleNumber: string; driverId: string | null }) => {
    setLoading(true)
    const result = await addVehicle(data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchVehicles()
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  const onUpdateVehicle = async (id: string, data: { vehicleNumber: string; driverId: string | null }) => {
    setLoading(true)
    const result = await updateVehicle(id, data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchVehicles()
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  const onDeleteVehicle = async (id: string) => {
    setLoading(true)
    const result = await deleteVehicle(id)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchVehicles()
    } else {
      toast({ title: 'Error', description: result.message })
    }
    setLoading(false)
  }

  return {
    vehicles,
    drivers,
    loading,
    onAddVehicle,
    onUpdateVehicle,
    onDeleteVehicle
  }
}