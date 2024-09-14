'use client'
import useSideBar from '@/context/use-sidebar'
import React from 'react'

type Props = {}

const BreadCrumb = (props: Props) => {
  const {
    page,
  } = useSideBar()
  return (
    <div className="flex flex-col ">
      <div className="flex gap-5 items-center">
        <h2 className="text-3xl font-bold capitalize">{page}</h2>
      </div>
      <p className="text-gray-500 text-sm pt-1">
        {page == 'settings'
          ? 'Manage your account settings, preferences and integrations'
          : page == 'dashboard'
          ? 'A detailed overview of your metrics, usage, customers and more'
          : page == 'vehicle'
          ? 'Add, view and edit all your vehicles'
          : page == 'driver'
          ? 'Add, view and edit all your drivers'
          : page == 'customer'
          ? 'Add, view and edit all your customers'
          : page == 'booking'
          ? 'Create and manage all your bookings'
          : page == 'tracking'
          ? 'Track your vehicles'
          : page == 'report'
          ? 'View and download your reports'
          : ''}
      </p>
    </div>
  )
}

export default BreadCrumb
