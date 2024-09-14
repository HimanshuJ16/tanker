import { BotIcon } from '@/icons/bot-icon'
import CalIcon from '@/icons/cal-icon'
import ChatIcon from '@/icons/chat-icon'
import DashboardIcon from '@/icons/dashboard-icon'
import DevicesIcon from '@/icons/devices-icon'
import DocumentsIcon from '@/icons/documents-icon'
import HelpDeskIcon from '@/icons/help-desk-icon'
import MoneyIcon from '@/icons/money-icon'
import PersonIcon from '@/icons/person-icon'
import PremiumBadge from '@/icons/premium-badge'
import SettingsIcon from '@/icons/settings-icon'

type SIDE_BAR_MENU_PROPS = {
  label: string
  icon: JSX.Element
  path: string
}

export const SIDE_BAR_MENU: SIDE_BAR_MENU_PROPS[] = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: 'dashboard',
  },
  {
    label: 'Vehicles',
    icon: <ChatIcon />,
    path: 'vehicle',
  },
  {
    label: 'Drivers',
    icon: <PersonIcon />,
    path: 'driver',
  },
  {
    label: 'Customers',
    icon: <PremiumBadge />,
    path: 'customer',
  },
  {
    label: 'Bookings',
    icon: <CalIcon />,
    path: 'booking',
  },
  {
    label: 'Tracking',
    icon: <DevicesIcon />,
    path: 'tracking',
  },
  {
    label: 'Reports',
    icon: <MoneyIcon />,
    path: 'report',
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    path: 'settings',
  },
]