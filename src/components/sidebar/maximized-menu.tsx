import { SIDE_BAR_MENU } from '@/constants/menu'
import { LogOut, Menu, MonitorSmartphone } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import MenuItem from './menu-item'

type Props = {
  onExpand(): void
  current: string
  onSignOut(): void
  userRole: string
  district: string
  userId: string
}

const MaxMenu = ({ current, onExpand, onSignOut, userRole, district, userId }: Props) => {
  const filteredMenu = userRole === 'contractor' 
    ? SIDE_BAR_MENU.filter(item => ['dashboard', 'create-account', 'vehicle', 'customer', 'hydrant', 'destination', 'report', 'billings', 'settings'].includes(item.path.split('/').pop() || ''))
    : SIDE_BAR_MENU.filter(item => ['dashboard', 'vehicle', 'customer', 'booking', 'tracking', 'report', 'settings', 'hydrant', 'destination'].includes(item.path.split('/').pop() || ''))

  return (
    <div className="py-3 px-4 flex flex-col h-full">
      <div className="flex justify-between items-center">
        <Image
          src="/images/logo.png"
          alt="LOGO"
          sizes="100vw"
          className="animate-fade-in opacity-0 delay-300 fill-mode-forwards"
          style={{
            width: '85%',
            height: 'auto',
          }}
          width={0}
          height={0}
        />
        <Menu
          className="cursor-pointer animate-fade-in opacity-0 delay-300 fill-mode-forwards"
          onClick={onExpand}
        />
      </div>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 mb-3">MENU</p>
          {filteredMenu.map((menu, key) => (
            <MenuItem
              size="max"
              {...menu}
              key={key}
              current={current}
              path={menu.path.replace('[district]', district).replace('[role]', userRole).replace('[id]', userId)}
            />
          ))}
        </div>
        <div className="flex flex-col">
          <p className="text-xs text-gray-500 mb-3">OPTIONS</p>
          <MenuItem
            size="max"
            label="Sign out"
            icon={<LogOut />}
            onSignOut={onSignOut}
          />
          <MenuItem
            size="max"
            label="Mobile App"
            icon={<MonitorSmartphone />}
          />
        </div>
      </div>
    </div>
  )
}

export default MaxMenu