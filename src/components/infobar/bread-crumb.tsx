'use client'
import useSideBar from '@/context/use-sidebar'
import React from 'react'

const BreadCrumb = () => {
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
          ? 'Manage your account settings'
          : page == 'dashboard'
          ? 'A detailed overview of your metrics, usage, customers and more'
          : page == 'vehicle'
          ? 'Add, view and edit all your vehicles'
          : page == 'hydrant'
          ? 'Add, view and edit all your hydrants'
          : page == 'destination'
          ? 'Add, view and edit all your destinations'
          : page == 'customer'
          ? 'Add, view and edit all your customers'
          : page == 'booking'
          ? 'Create and manage all your bookings'
          : page == 'tracking'
          ? 'Track your vehicles'
          : page == 'report'
          ? 'View and download your reports'
          : page == 'billings'
          ? 'View and pay your bills'
          : page == 'create-account'
          ? 'Create accounts for desired roles'
          : ''}
      </p>
    </div>
  )
}

export default BreadCrumb
