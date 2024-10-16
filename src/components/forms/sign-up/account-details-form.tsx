import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister, UseFormSetValue } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { USER_REGISTRATION_FORM } from '@/constants/forms'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type Props = {
  register: UseFormRegister<FieldValues>
  errors: FieldErrors<FieldValues>
  districts: string[]
  loading: boolean
  setValue: UseFormSetValue<FieldValues>
}

export default function Component({ errors, register, districts, loading, setValue }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Account details</h2>
        <p className="mt-1 text-sm text-gray-600">Enter your email, password, select your district and designation</p>
      </div>
      {USER_REGISTRATION_FORM.map((field) => {
        if (field.name === 'district') {
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor="district"></Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={(value) => setValue('district', value)} {...register('district')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a district" />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((district, index) => (
                      <SelectItem key={`district-${index}`} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.district && (
                <p className="text-sm text-red-500">{errors.district.message as string}</p>
              )}
            </div>
          )
        }
        if (field.name === 'designation') {
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor="designation"></Label>
              <Select onValueChange={(value) => setValue('designation', value)} {...register('designation')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a designation" />
                </SelectTrigger>
                <SelectContent>
                  {['user', 'se', 'xen', 'aen', 'jen'].map((designation) => (
                    <SelectItem key={designation} value={designation}>
                      {designation.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.designation && (
                <p className="text-sm text-red-500">{errors.designation.message as string}</p>
              )}
            </div>
          )
        }
        return (
          <FormGenerator
            key={field.id}
            {...field}
            errors={errors}
            register={register}
            name={field.name}
            options={field.options}
          />
        )
      })}
    </div>
  )
}