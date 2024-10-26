import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { getHydrants, addHydrant, updateHydrant, deleteHydrant } from '@/actions/hydrant'
import { Hydrant } from '@prisma/client'
import { HydrantSchemaType } from '@/schemas/hydrant.schema'

export const useHydrants = () => {
  const [hydrants, setHydrants] = useState<Hydrant[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const fetchHydrants = async () => {
    setLoading(true)
    const fetchedHydrants = await getHydrants()
    if (fetchedHydrants) {
      setHydrants(fetchedHydrants)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchHydrants()
  }, [])

  const onAddHydrant = async (data: HydrantSchemaType) => {
    setLoading(true)
    const result = await addHydrant(data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchHydrants()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const onUpdateHydrant = async (id: string, data: HydrantSchemaType) => {
    setLoading(true)
    const result = await updateHydrant(id, data)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchHydrants()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  const onDeleteHydrant = async (id: string) => {
    setLoading(true)
    const result = await deleteHydrant(id)
    if (result.status === 200) {
      toast({ title: 'Success', description: result.message })
      await fetchHydrants()
    } else {
      toast({ title: 'Error', description: result.message, variant: 'destructive' })
    }
    setLoading(false)
  }

  return {
    hydrants,
    loading,
    onAddHydrant,
    onUpdateHydrant,
    onDeleteHydrant
  }
}