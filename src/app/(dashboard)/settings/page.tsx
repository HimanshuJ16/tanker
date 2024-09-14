import ChangePassword from '@/components/settings/change-password'
import DeleteAccount from '@/components/settings/delete-account'
import React from 'react'

const Page = () => {
  return (
    <>
      <div className="overflow-y-auto w-full chat-window flex-1 h-0 flex flex-col gap-10">
        <ChangePassword />
        <DeleteAccount />
      </div>
    </>
  )
}

export default Page
