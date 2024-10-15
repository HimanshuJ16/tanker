import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { USER_REGISTRATION_FORM } from '@/constants/forms'
import { Skeleton } from '@/components/ui/skeleton'

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  districts: string[]
  loading: boolean
  setValue: UseFormSetValue<FieldValues>
}

export default function AccountDetailsForm({ errors, register, districts, loading, setValue }: Props) {
  React.useEffect(() => {
    if (districts.length === 0) {
      setValue('district', 'no-districts');
    }
  }, [districts, setValue]);

  return (
    <>
      <h2 className="text-gravel md:text-4xl font-bold">Account details</h2>
      <p className="text-iridium md:text-sm">Enter your email, password, and select your district</p>
      {USER_REGISTRATION_FORM.map((field) => (
        <FormGenerator
          key={field.id}
          {...field}
          errors={errors}
          register={register}
          name={field.name}
          options={field.name === 'district' ? districts.map((district, index) => ({
            value: district,
            label: district,
            id: `district-${index}`
          })) : field.options}
          loading={field.name === 'district' ? loading : undefined}
        />
      ))}
    </>
  )
}