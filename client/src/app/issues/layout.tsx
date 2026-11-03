import IssueProvider from '@/providers/IssueProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <IssueProvider >
                {children}
            </IssueProvider>
        </>
    )
}

export default layout