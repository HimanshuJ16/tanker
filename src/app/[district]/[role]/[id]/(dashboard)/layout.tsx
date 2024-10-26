import InfoBar from '@/components/infobar'
import SideBar from '@/components/sidebar'
import React from 'react'
import { getUserDistrict, getUserId, getUserRole } from '@/actions/settings'
import { redirect } from 'next/navigation'

type Props = {
  children: React.ReactNode
}

export default async function DashboardLayout({ children }: Props) {
  const userRole = await getUserRole()
  const userId = await getUserId()
  const district = await getUserDistrict()

  if (userRole === null || userId === null || district === null) {
    redirect('/auth/sign-in')
  }

  return (
    <div className="flex h-screen w-full">
      <SideBar userRole={userRole} district={district} userId={userId} />
      <div className="w-full h-screen flex flex-col py-2 pl-20 pr-5 md:pl-4">
        <InfoBar />
        {children}
      </div>
    </div>
  )
}