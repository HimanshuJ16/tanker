'use client'

import { Button } from '@/components/ui/button'
import { useSignUpForm } from '@/hooks/sign-up/use-sign-up'
import Link from 'next/link'
import React from 'react'
import { useFormContext } from 'react-hook-form'

type Props = {
  contractorId?: string
}

export default function ButtonHandler({ contractorId }: Props) {
  const { formState } = useFormContext()
  const { onHandleSubmit, loading } = useSignUpForm()

  const isFormValid = formState.isValid
  const isDirty = formState.isDirty

  return (
    <div className="w-full flex flex-col gap-3 items-center">
      <Button
        type="submit"
        className="w-full"
        disabled={!isFormValid || !isDirty || loading}
      >
        {loading ? 'Creating account...' : 'Create an account'}
      </Button>
      {!contractorId ? (
        <p>
        Already have an account?{' '}
        <Link href="/auth/sign-in" className="font-bold">
          Sign In
        </Link>
      </p>
      ) : null}
    </div>
  )
}