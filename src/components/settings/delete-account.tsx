'use client'
import React from 'react'
import { Button } from '../ui/button'
import { Loader } from '../loader'
import Section from '../section-label'
import { useDeleteUser } from '@/hooks/settings/use-settings'

const DeleteAccount = () => {
  const { onDelete, loading } = useDeleteUser()

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
      <div className="lg:col-span-1">
        <Section
          label="Delete Account"
          message="Delete your account"
        />
      </div>     
      <div className="lg:w-[500px] flex flex-col gap-3">
        <Button onClick={onDelete} className="bg-red-400 hover:bg-red-500 text-gray-700 font-semibold">
          <Loader loading={loading}>Delete Account</Loader>
        </Button>
      </div>
    </div>
  )
}

export default DeleteAccount