import CalIcon from '@/icons/cal-icon'
import ChatIcon from '@/icons/chat-icon'
import DashboardIcon from '@/icons/dashboard-icon'
import DevicesIcon from '@/icons/devices-icon'
import DocumentsIcon from '@/icons/documents-icon'
import EmailIcon from '@/icons/email-icon'
import MoneyIcon from '@/icons/money-icon'
import PersonIcon from '@/icons/person-icon'
import PremiumBadge from '@/icons/premium-badge'
import SettingsIcon from '@/icons/settings-icon'
import { TransactionsIcon } from '@/icons/transactions-icon'

type SIDE_BAR_MENU_PROPS = {
  label: string
  icon: JSX.Element
  path: string
}

export const SIDE_BAR_MENU: SIDE_BAR_MENU_PROPS[] = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '[district]/[role]/[id]/dashboard',
  },
  {
    label: 'Create Accounts',
    icon: <PersonIcon />,
    path: '[district]/[role]/[id]/create-account',
  },
  {
    label: 'Customers',
    icon: <PremiumBadge />,
    path: '[district]/[role]/[id]/customer',
  },
  {
    label: 'Destinations',
    icon: <EmailIcon />,
    path: '[district]/[role]/[id]/destination',
  },
  {
    label: 'Vehicles',
    icon: <ChatIcon />,
    path: '[district]/[role]/[id]/vehicle',
  },
  {
    label: 'Hydrants',
    icon: <PersonIcon />,
    path: '[district]/[role]/[id]/hydrant',
  },
  {
    label: 'Bookings',
    icon: <CalIcon />,
    path: '[district]/[role]/[id]/booking',
  },
  {
    label: 'Tracking',
    icon: <DevicesIcon />,
    path: '[district]/[role]/[id]/tracking',
  },
  {
    label: 'Reports',
    icon: <DocumentsIcon />,
    path: '[district]/[role]/[id]/report',
  },
  {
    label: 'Billings',
    icon: <MoneyIcon />,
    path: '[district]/[role]/[id]/billings',
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '[district]/[role]/[id]/settings',
  },
]