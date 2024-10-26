'use client'
import React from 'react'
import { useFormContext } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { USER_LOGIN_FORM } from '@/constants/forms'

export default function LoginForm() {
  const {
    register,
    formState: { errors },
    control
  } = useFormContext()
  return (
    <>
      <h2 className="text-gravel md:text-4xl font-bold">Login</h2>
      {USER_LOGIN_FORM.map((field) => (
        <FormGenerator
          key={field.id}
          {...field}
          errors={errors}
          register={register}
          control={control}
          name={field.name}
        />
      ))}
    </>
  )
}