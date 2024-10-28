// 'use client'

import { useToast } from '@/hooks/use-toast'
import { UserRegistrationProps, UserRegistrationSchema } from '@/schemas/auth.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { onCompleteUserRegistration, fetchParentRoles, fetchContractorDistrict } from '@/actions/auth'

export function useSignUpForm(contractorId?: string) {
  const { toast } = useToast()
  const [loading, setLoading] = useState<boolean>(false)
  const [districts, setDistricts] = useState<string[]>([])
  const [districtsFetched, setDistrictsFetched] = useState<boolean>(false)
  const [parentRoles, setParentRoles] = useState<{ id: string; username: string; name: string }[]>([])
  const router = useRouter()
  
  const methods = useForm<UserRegistrationProps>({
    resolver: zodResolver(UserRegistrationSchema),
    defaultValues: {
      district: '',
      role: '',
      parentId: '',
    },
    mode: 'onChange',
  })

  const fetchParentRolesData = useCallback(async (district: string, role: string) => {
    if (district && ['aen', 'jen', 'vendor'].includes(role)) {
      try {
        const parentRolesData = await fetchParentRoles(district, role)
        console.log('Fetched parent roles:', parentRolesData)
        setParentRoles(parentRolesData)
        if (parentRolesData.length > 0) {
          methods.setValue('parentId', parentRolesData[0].id)
        } else {
          methods.setValue('parentId', '')
        }
      } catch (error) {
        console.error('Failed to fetch parent roles:', error)
        toast({
          title: 'Error',
          description: 'Failed to load parent roles. Please try again later.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    } else {
      setParentRoles([])
      methods.setValue('parentId', '')
    }
  }, [methods, toast])

  useEffect(() => {
    const fetchDistricts = async () => {
      if (districtsFetched) return;
  
      setLoading(true);
      try {
        if (contractorId) {
          console.log(`Fetching district for user ID: ${contractorId}`)
          const district = await fetchContractorDistrict(contractorId)
          if (district) {
            console.log(`District fetched: ${district}`)
            setDistricts([district])
            methods.setValue('district', district)
          } else {
            console.error(`No district returned for user ID: ${contractorId}`)
            throw new Error('Failed to fetch user district')
          }
        } else {
          const response = await fetch('/api/districts');
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          if (!Array.isArray(data)) {
            throw new Error('Unexpected data format');
          }
          setDistricts(data);
          if (data.length > 0) {
            methods.setValue('district', data[0]);
          }
        }
        setDistrictsFetched(true);
      } catch (error) {
        console.error('Failed to fetch districts:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load districts. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
  
    fetchDistricts();
  }, [toast, districtsFetched, methods, contractorId]);

  useEffect(() => {
    const district = methods.watch('district')
    const role = methods.watch('role')
    fetchParentRolesData(district, role)
  }, [methods.watch('district'), methods.watch('role'), fetchParentRolesData])

  const onHandleSubmit = methods.handleSubmit(
    async (values: UserRegistrationProps) => {
      try {
        setLoading(true)
        
        const registered = await onCompleteUserRegistration(
          values.fullname,
          values.username,
          values.password,
          values.contactNumber,
          values.email,
          values.district.toLowerCase(),
          values.role,
          values.parentId,
          contractorId
        )

        if (registered?.status !== 200 || !registered.user) {
          throw new Error(`User registration failed. Status: ${registered?.status}`)
        }

        setLoading(false)
        if (contractorId) {
          router.push(`/${values.district}/contractor/${contractorId}/dashboard`)
        } else {
          router.push(`/${values.district}/${values.role}/${registered.user.id}/dashboard`)
        }
      } catch (error) {
        setLoading(false)
        console.error('Registration error:', error)
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        })
      }
    }
  )

  return {
    methods,
    onHandleSubmit,
    loading,
    districts,
    parentRoles,
    fetchParentRolesData,
  }
}