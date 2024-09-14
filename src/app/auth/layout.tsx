import { currentUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const Layout = async ({ children }: Props) => {
  const user = await currentUser()

  if (user) redirect('/')

  return (
    <div className="h-screen flex w-full justify-center">
      <div className="w-[600px] ld:w-full flex flex-col items-start p-6">
        <Link href='/'>
          <Image
            src="/images/logo.png"
            alt="LOGO"
            sizes="100vw"
            style={{
              width: '200px',
              height: 'auto',
            }}
            width={0}
            height={0}
          />
        </Link>
        {children}
      </div>
      <div className="hidden lg:flex flex-1 w-full max-h-full max-w-4000px overflow-hidden relative bg-cream  flex-col pt-10 pl-24 gap-3">
        <h2 className="text-gravel md:text-4xl font-bold">
          Hi, Here is your tanker management system, PHEDtracker!
        </h2>
        <p className="text-iridium md:text-sm mt-2 mb-5">
          PHEDtracker is capable of capturing live location of your tanker fleet and their performance to increase your efficiency.{' '}
        </p>
        <Image
          src="/images/icon.png"
          alt="app image"
          loading="lazy"
          sizes="30"
          className="absolute shrink-0 !w-[800px] top-48"
          width={0}
          height={0}
        />
      </div>
    </div>
  )
}

export default Layout