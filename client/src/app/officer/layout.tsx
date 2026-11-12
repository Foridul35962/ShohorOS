import OfficerProvider from '@/providers/OfficerProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <OfficerProvider >
            {children}
        </OfficerProvider>
    )
}

export default layout