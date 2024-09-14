'use client'

import { useToast } from '@/hooks/use-toast'
import {
  UserRegistrationProps,
  UserRegistrationSchema,
} from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { onCompleteUserRegistration } from '@/actions/auth'

export const useSignUpForm = () => {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      type: 'owner',
    },
    mode: 'onChange',
  })

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!isLoaded) {
      toast({
        title: 'Error',
        description: 'Authentication system is not ready.',
      })
      return
    }

    try {
      await signUp.create({
        emailAddress: email,
        password: password,
      })

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      onNext((prev) => prev + 1)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
      toast({
        title: 'Error',
        description: errorMessage,
      })
    }
  }

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      if (!isLoaded) {
        toast({
          title: 'Error',
          description: 'Authentication system is not ready.',
        })
        return
      }

      try {
        setLoading(true)
        const completeSignUp = await signUp.attemptEmailAddressVerification({
          code: values.otp,
        })

        if (completeSignUp.status !== 'complete') {
          throw new Error('Something went wrong during sign up completion.')
        }

        if (!signUp.createdUserId) {
          throw new Error('User ID is missing after sign up.')
        }

        const registered = await onCompleteUserRegistration(
          values.fullname,
          signUp.createdUserId,
          values.type
        )

        if (registered?.status !== 200 || !registered.user) {
          throw new Error('User registration failed.')
        }

        await setActive({
          session: completeSignUp.createdSessionId,
        })

        setLoading(false)
        router.push('/dashboard')
      } catch (error) {
        setLoading(false)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        toast({
          title: 'Error',
          description: errorMessage,
        })
      }
    }
  )

  return {
    methods,
    onHandleSubmit,
    onGenerateOTP,
    loading,
  }
}