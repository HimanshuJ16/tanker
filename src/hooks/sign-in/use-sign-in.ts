import { useToast } from '@/hooks/use-toast'
import { UserLoginProps, UserLoginSchema } from '@/schemas/auth.schema'
import { useSignIn } from '@clerk/nextjs'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

export const useSignInForm = () => {
  const { isLoaded, setActive, signIn } = useSignIn()
  const [loading, setLoading] = useState<boolean>(false)
  const router = useRouter()
  const { toast } = useToast()
  const methods = useForm<UserLoginProps>({
    resolver: zodResolver(UserLoginSchema),
    mode: 'onChange',
  })

  const onHandleSubmit = methods.handleSubmit(async (values: UserLoginProps) => {
    if (!isLoaded || !signIn) {
      toast({
        title: 'Error',
        description: 'Authentication system is not ready',
      })
      return
    }

    setLoading(true)
    try {
      const result = await signIn.create({
        identifier: values.email,
        password: values.password,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        toast({
          title: 'Success',
          description: 'Welcome back!',
        })
        router.push('/dashboard')
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message || 'An unexpected error occurred',
        })
      } else if (typeof error === 'object' && error !== null && 'errors' in error) {
        const clerkError = error as { errors: Array<{ code: string, message: string }> }
        const errorMessage = clerkError.errors[0]?.message || 'An unexpected error occurred'
        toast({
          title: 'Error',
          description: errorMessage,
        })
      } else {
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
        })
      }
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