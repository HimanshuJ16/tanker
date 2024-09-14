import Image from 'next/image'
import React from 'react'

type MenuLogoProps = {
  onClick(): void
}

export const MenuLogo = ({ onClick }: MenuLogoProps) => {
  return (
    <Image onClick={onClick} src="/images/tank-truck.png" alt="LOGO" width={30} height={30} />
  )
}
