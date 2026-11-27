import DashboardProvider from '@/providers/DashboardProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <DashboardProvider >
            {children}
        </DashboardProvider>
    )
}

export default layout