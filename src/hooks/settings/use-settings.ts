'use client'

import { onUpdatePassword, onDeleteUser } from '@/actions/settings'
import { useToast } from '@/hooks/use-toast'
import { ChangePasswordProps, ChangePasswordSchema } from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const useChangePassword = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordProps>({
    resolver: zodResolver(ChangePasswordSchema),
    mode: 'onChange',
  })
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)

  const onChangePassword = handleSubmit(async (values) => {
    try {
      setLoading(true)
      const result = await onUpdatePassword(values.password)
      if (result.status === 200) {
        reset()
        toast({ title: 'Success', description: result.message })
      } else {
        toast({ title: 'Error', description: result.message })
      }
    } catch (error) {
      console.error('Error updating password:', error)
      toast({ title: 'Error', description: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  })

  return {
    register,
    errors,
    onChangePassword,
    loading,
  }
}

export const useDeleteUser = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()

  const onDelete = async () => {
    try {
      setLoading(true)
      const result = await onDeleteUser()
      if (result.status === 200) {
        toast({ title: 'Success', description: result.message })
        router.push('/')
      } else {
        toast({ title: 'Error', description: result.message })
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast({ title: 'Error', description: 'An error occurred' })
    } finally {
      setLoading(false)
    }
  }

  return {
    onDelete,
    loading,
  }
}