import React from 'react'
import SignUpFormProvider from '@/components/forms/sign-up/form-provider'
import RegistrationFormStep from '@/components/forms/sign-up/registration-step'
import ButtonHandler from '@/components/forms/sign-up/button-handlers'

export default function SignUp() {
  return (
    <div className="py-16 md:px-16 w-full">
        <SignUpFormProvider>
          <div className="flex flex-col gap-3">
            <RegistrationFormStep />
            <ButtonHandler />
          </div>
        </SignUpFormProvider>
    </div>
  )
}