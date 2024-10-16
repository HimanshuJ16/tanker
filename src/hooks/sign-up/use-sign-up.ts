'use client'

import { useToast } from '@/hooks/use-toast'
import { UserRegistrationProps, UserRegistrationSchema } from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { onCompleteUserRegistration } from '@/actions/auth'

export function useSignUpForm() {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const [districts, setDistricts] = useState<string[]>([])
  const [districtsFetched, setDistrictsFetched] = useState<boolean>(false)
  const { signUp, isLoaded, setActive } = useSignUp()
  const router = useRouter()
  
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      type: 'owner',
      district: '',
    },
    mode: 'onChange',
  })

  useEffect(() => {
    const fetchDistricts = async () => {
      if (districtsFetched) return; // Prevent multiple fetches

      setLoading(true);
      try {
        const response = await fetch('/api/districts')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        if (!Array.isArray(data)) {
          throw new Error('Unexpected data format')
        }
        setDistricts(data)
        setDistrictsFetched(true)
        if (data.length > 0) {
          methods.setValue('district', data[0]) // Set default district
        }
      } catch (error) {
        console.error('Failed to fetch districts:', error)
        if (error instanceof Error) {
          console.error('Error details:', error.message)
        }
        toast({
          title: 'Error',
          description: 'Failed to load districts. Please try again later.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchDistricts()
  }, [toast, districtsFetched, methods])

  const onGenerateOTP = async (
    email: string,
    password: string,
    onNext: React.Dispatch<React.SetStateAction<number>>
  ) => {
    if (!isLoaded) {
      toast({
        title: 'Error',
        description: 'Authentication system is not ready.',
        variant: 'destructive',
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
        variant: 'destructive',
      })
    }
  }

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      if (!isLoaded) {
        toast({
          title: 'Error',
          description: 'Authentication system is not ready.',
          variant: 'destructive',
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

        if (!values.district) {
          throw new Error('District is required.')
        }

        const registered = await onCompleteUserRegistration(
          values.fullname,
          signUp.createdUserId,
          values.type,
          values.district
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
          variant: 'destructive',
        })
      }
    }
  )

  return {
    methods,
    onHandleSubmit,
    onGenerateOTP,
    loading,
    districts,
  }
}