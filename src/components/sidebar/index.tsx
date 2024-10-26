'use client'

import useSideBar from '@/context/use-sidebar'
import { cn } from '@/lib/utils'
import React from 'react'
import MaxMenu from './maximized-menu'
import { MinMenu } from './minimized-menu'

type Props = {
  userRole: string
  district: string
  userId: string
}

const SideBar = ({ userRole, district, userId }: Props) => {
  const { expand, onExpand, page, onSignOut } = useSideBar()

  return (
    <div
      className={cn(
        'bg-cream dark:bg-neutral-950 h-full w-[60px] fill-mode-forwards fixed md:relative',
        expand == undefined && '',
        expand == true
          ? 'animate-open-sidebar'
          : expand == false && 'animate-close-sidebar'
      )}
    >
      {expand ? (
        <MaxMenu
          current={page!}
          onExpand={onExpand}
          onSignOut={onSignOut}
          userRole={userRole}
          district={district}
          userId={userId}
        />
      ) : (
        <MinMenu
          onShrink={onExpand}
          current={page!}
          onSignOut={onSignOut}
          userRole={userRole}
          district={district}
          userId={userId}
        />
      )}
    </div>
  )
}

export default SideBar