import InspectorProvider from '@/providers/InspectorProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <InspectorProvider >
            {children}
        </InspectorProvider>
    )
}

export default layout