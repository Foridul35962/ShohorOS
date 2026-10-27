import ModeratorProvider from '@/providers/ModeratorProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <ModeratorProvider>
                {children}
            </ModeratorProvider>
        </>
    )
}

export default layout