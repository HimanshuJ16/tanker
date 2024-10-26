import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '@/actions/vehicles'
import { Vehicle } from '@prisma/client'
import { VehicleSchemaType } from '@/schemas/vehicle.schema'

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
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

  useEffect(() => {
    fetchVehicles()
  }, [])

  const onAddVehicle = async (data: VehicleSchemaType) => {
    setLoading(true)
    const result = await addVehicle(data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchVehicles()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const onUpdateVehicle = async (id: string, data: VehicleSchemaType) => {
    setLoading(true)
    const result = await updateVehicle(id, data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchVehicles()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
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
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  return {
    vehicles,
    loading,
    onAddVehicle,
    onUpdateVehicle,
    onDeleteVehicle
  }
}