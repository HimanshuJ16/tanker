'use client'
import { useAuthContextHook } from '@/context/use-auth-context'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import TypeSelectionForm from './type-selection-form'
import AccountDetailsForm from './account-details-form'
import OTPForm from './otp-form'
import { useSignUpForm } from '@/hooks/sign-up/use-sign-up'

export default function RegistrationFormStep() {
  const { register, formState: { errors }, setValue } = useFormContext()
  const { currentStep } = useAuthContextHook()
  const { districts, loading } = useSignUpForm()
  const [onOTP, setOnOTP] = React.useState<string>('')
  const [onUserType, setOnUserType] = React.useState<'owner' | 'supervisor'>('owner')

  React.useEffect(() => {
    setValue('otp', onOTP)
  }, [onOTP, setValue])

  switch (currentStep) {
    case 1:
      return (
        <TypeSelectionForm
          register={register}
          userType={onUserType}
          setUserType={setOnUserType}
        />
      )
    case 2:
      return (
        <AccountDetailsForm
          errors={errors}
          register={register}
          setValue={setValue}
          districts={districts}
          loading={loading}
        />
      )
    case 3:
      return (
        <OTPForm
          onOTP={onOTP}
          setOTP={setOnOTP}
        />
      )
    default:
      return null
  }
}