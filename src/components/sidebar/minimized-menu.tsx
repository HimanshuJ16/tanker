import { SIDE_BAR_MENU } from '@/constants/menu'
import React from 'react'
import { LogOut, MonitorSmartphone } from 'lucide-react'
import { MenuLogo } from '@/icons/menu-logo'
import MenuItem from './menu-item'

type MinMenuProps = {
  onShrink(): void
  current: string
  onSignOut(): void
  userRole: string
  district: string
  userId: string
}

export const MinMenu = ({
  onShrink,
  current,
  onSignOut,
  userRole,
  district,
  userId,
}: MinMenuProps) => {
  const filteredMenu = userRole === 'contractor' 
    ? SIDE_BAR_MENU.filter(item => ['dashboard', 'create-account', 'vehicle', 'booking', 'customer', 'hydrant', 'destination', 'report', 'billings', 'settings'].includes(item.path.split('/').pop() || ''))
    : SIDE_BAR_MENU.filter(item => ['dashboard', 'vehicle', 'customer', 'booking', 'tracking', 'report', 'settings', 'hydrant', 'destination'].includes(item.path.split('/').pop() || ''))

  return (
    <div className="p-3 flex flex-col items-center h-full">
      <span className="animate-fade-in opacity-0 delay-300 fill-mode-forwards cursor-pointer">
        <MenuLogo onClick={onShrink} />
      </span>
      <div className="animate-fade-in opacity-0 delay-300 fill-mode-forwards flex flex-col justify-between h-full pt-10">
        <div className="flex flex-col">
          {filteredMenu.map((menu, key) => (
            <MenuItem
              size="min"
              {...menu}
              key={key}
              current={current}
              path={menu.path.replace('[district]', district).replace('[role]', userRole).replace('[id]', userId)}
            />
          ))}
        </div>
        <div className="flex flex-col">
          <MenuItem
            size="min"
            label="Sign out"
            icon={<LogOut />}
            onSignOut={onSignOut}
          />
          <MenuItem
            size="min"
            label="Mobile App"
            icon={<MonitorSmartphone />}
          />
        </div>
      </div>
    </div>
  )
}