'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { fetchContractorDistrict } from '@/actions/auth/index'
import { useToast } from '@/hooks/use-toast'
import SignUpFormProvider from '@/components/forms/sign-up/form-provider'
import RegistrationFormStep from '@/components/forms/sign-up/registration-step'
import ButtonHandler from '@/components/forms/sign-up/button-handlers'

export default function ContractorCreateAccountPage() {
  const { id } = useParams()
  const [isValidContractor, setIsValidContractor] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const validateContractor = async () => {
      try {
        if (typeof id !== 'string') {
          throw new Error('Invalid contractor ID')
        }
        await fetchContractorDistrict(id)
        setIsValidContractor(true)
      } catch (error) {
        console.error('Error validating contractor:', error)
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to validate contractor. Please try again.',
          variant: 'destructive',
        })
        setIsValidContractor(false)
      } finally {
        setLoading(false)
      }
    }

    validateContractor()
  }, [id, toast])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isValidContractor) {
    return <div>Invalid contractor ID. Please check the URL and try again.</div>
  }

  return (
    <div className="container mx-auto px-4">
      <SignUpFormProvider contractorId={id as string}>
        <RegistrationFormStep contractorId={id as string} />
        <ButtonHandler contractorId={id as string} />
      </SignUpFormProvider>
    </div>
  )
}