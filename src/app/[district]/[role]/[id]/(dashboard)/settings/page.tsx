import React from 'react'
import ChangePassword from '@/components/settings/change-password'
import DeleteAccount from '@/components/settings/delete-account'
import { Card, CardContent } from '@/components/ui/card'

const SettingsPage = () => {
  return (
    <div className="py-2 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <Card>
          <CardContent className="p-6">
            <ChangePassword />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <DeleteAccount />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default SettingsPage