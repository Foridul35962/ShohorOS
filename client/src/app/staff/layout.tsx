import StaffProvider from '@/providers/StaffProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <StaffProvider >
      {children}
    </StaffProvider>
  )
}

export default layout