'use client'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import { useSignUpForm } from '@/hooks/sign-up/use-sign-up'
import AccountDetailsForm from './account-details-form'

type Props = {
  contractorId?: string
}

export default function RegistrationFormStep({ contractorId }: Props) {
  const { register, control, formState: { errors }, setValue, watch } = useFormContext()
  const { districts, loading, parentRoles, fetchParentRolesData } = useSignUpForm(contractorId)

  return (
    <AccountDetailsForm
      errors={errors}
      register={register}
      control={control}
      setValue={setValue}
      watch={watch}
      districts={districts}
      loading={loading}
      parentRoles={parentRoles}
      fetchParentRolesData={fetchParentRolesData}
      contractorId={contractorId}
    />
  )   
}