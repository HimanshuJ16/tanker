'use client'

import React from 'react'
import SignUpFormProvider from '../forms/sign-up/form-provider'
import RegistrationFormStep from '../forms/sign-up/registration-step'
import ButtonHandler from '../forms/sign-up/button-handlers'

interface ContractorTeamMemberCreationProps {
  contractorCircleId: string
}

export default function ContractorTeamMemberCreation({ contractorCircleId }: ContractorTeamMemberCreationProps) {
  return (
    <SignUpFormProvider>
      <div className="flex flex-col gap-3">
        <RegistrationFormStep
          contractorId={contractorCircleId}
        />
        <ButtonHandler
          contractorId={contractorCircleId}
        />
      </div>
    </SignUpFormProvider>
  )
}