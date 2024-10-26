import { useToast } from '@/hooks/use-toast'
import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export function useSignInForm() {
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: 'onChange',
  })

  const onHandleSubmit = methods.handleSubmit(async (values: UserLoginProps) => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'Success',
          description: 'Welcome back!',
        })
        // Redirect to the user-specific dashboard
        router.push(`/${data.district}/${data.role}/${data.id}/dashboard`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Authentication failed')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    } finally {
      setLoading(false)
    }
  })

  return {
    methods,
    onHandleSubmit,
    loading,
  }
}