import React, { useEffect } from 'react'
import { FieldErrors, FieldValues, UseFormRegister, UseFormSetValue, UseFormWatch, Control } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { USER_REGISTRATION_FORM } from '@/constants/forms'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type Props = {
  register: UseFormRegister<FieldValues>
  control: Control<FieldValues>
  errors: FieldErrors<FieldValues>
  districts: string[]
  loading: boolean
  setValue: UseFormSetValue<FieldValues>
  parentRoles: { id: string; username: string; name: string }[]
  watch: UseFormWatch<FieldValues>
  fetchParentRolesData: (district: string, role: string) => Promise<void>
  contractorId?: string
}

export default function AccountDetailsForm({ 
  errors, 
  register, 
  control, 
  districts, 
  loading, 
  setValue, 
  parentRoles, 
  watch,
  fetchParentRolesData,
  contractorId
}: Props) {
  const role = watch('role')
  const district = watch('district')
  const showParentRoles = ['aen', 'jen', 'vendor'].includes(role)

  useEffect(() => {
    console.log('Parent Roles in AccountDetailsForm:', parentRoles)
  }, [parentRoles])

  useEffect(() => {
    if (district && role) {
      fetchParentRolesData(district, role)
    }
  }, [district, role, fetchParentRolesData])

  return (
    <div className="space-y-6">
      {!contractorId ? 
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Account details</h2>
          <p className="mt-1 text-sm text-gray-600">Enter your email, password, select your district and designation</p>
        </div> : null
      }
      {USER_REGISTRATION_FORM.map((field) => {
        if (field.name === 'district') {
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor="district"></Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={(value) => setValue('district', value)} value={district} disabled={!!contractorId}>
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
        if (field.name === 'role') {
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor="role"></Label>
              <Select 
                onValueChange={(value) => {
                  setValue('role', value)
                  setValue('parentId', '')
                }}
                value={role}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {contractorId ? ['se', 'xen', 'aen', 'jen', 'vendor'].map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.toUpperCase()}
                    </SelectItem>
                  )) : ['contractor', 'se', 'xen', 'aen', 'jen', 'vendor'].map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message as string}</p>
              )}
            </div>
          )
        }
        if (field.name === 'parentId' && showParentRoles) {
          return (
            <div key={field.id} className="space-y-2">
              <Label htmlFor="parentId"></Label>
              {loading ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select onValueChange={(value) => setValue('parentId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a parent" />
                  </SelectTrigger>
                  <SelectContent>
                    {parentRoles.map((parent) => (
                      <SelectItem key={parent.id} value={parent.id}>
                        {parent.username} - {parent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.parentId && (
                <p className="text-sm text-red-500">{errors.parentId.message as string}</p>
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
            control={control}
            name={field.name}
            options={field.options}
          />
        )
      })}
    </div>
  )
}