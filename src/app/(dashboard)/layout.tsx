// import { onLoginUser } from '@/actions/auth'
import InfoBar from '@/components/infobar'
import SideBar from '@/components/sidebar'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const OwnerLayout = async ({ children }: Props) => {
  return (
    <div className="flex h-screen w-full">
      <SideBar />
      <div className="w-full h-screen flex flex-col py-2 pl-20 pr-5 md:pl-4">
        <InfoBar />
        {children}
      </div>
    </div>
  )
}

export default OwnerLayout
