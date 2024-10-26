'use client'
import { Loader } from '@/components/loader'
import { AuthContextProvider } from '@/context/use-auth-context'
import { useSignUpForm } from '@/hooks/sign-up/use-sign-up'
import React from 'react'
import { FormProvider } from 'react-hook-form'

type Props = {
  children: React.ReactNode
  contractorId?: string
}

export default function SignUpFormProvider({ children, contractorId }: Props) {
  const { methods, onHandleSubmit, loading } = useSignUpForm(contractorId)

  return (
    <AuthContextProvider>
      <FormProvider {...methods}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            onHandleSubmit()
          }}
          className="h-full"
        >
          <div className="flex flex-col justify-between gap-3 h-full">
            <Loader loading={loading}>{children}</Loader>
          </div>
        </form>
      </FormProvider>
    </AuthContextProvider>
  )
}