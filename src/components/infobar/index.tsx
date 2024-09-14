import React from 'react'
import BreadCrumb from './bread-crumb'
import { getUserFullName } from '@/actions/settings'

type Props = {}

const InfoBar = async (props: Props) => {
  const fullname = await getUserFullName();
  if(!fullname) return null
  return (
    <div className="flex w-full justify-between items-center py-1 mb-8 ">
      <BreadCrumb />
      <div className="flex gap-3 items-center bg-[#7ccff3] px-4 py-2 rounded-[50px] text-[14px]">
        <div> Hi, {fullname}</div>
      </div>
    </div>
  )
}

export default InfoBar
