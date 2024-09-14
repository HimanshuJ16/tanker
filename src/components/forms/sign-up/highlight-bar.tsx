'use client'
import { useAuthContextHook } from '@/context/use-auth-context'
import { cn } from '@/lib/utils'
import React from 'react'

// type Props = {}

const HighLightBar = () => {
  const { currentStep } = useAuthContextHook()

  return (
    <div className="grid grid-cols-3 gap-3">
      <div
        className={cn(
          'rounded-full h-2 col-span-1',
          currentStep == 1 ? 'bg-[#32BCF9]' : 'bg-platinum'
        )}
      ></div>
      <div
        className={cn(
          'rounded-full h-2 col-span-1',
          currentStep == 2 ? 'bg-[#32BCF9]' : 'bg-platinum'
        )}
      ></div>
      <div
        className={cn(
          'rounded-full h-2 col-span-1',
          currentStep == 3 ? 'bg-[#32BCF9]' : 'bg-platinum'
        )}
      ></div>
    </div>
  )
}

export default HighLightBar
