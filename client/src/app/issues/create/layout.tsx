import IssueCreateProvider from '@/providers/IssueCreateProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <IssueCreateProvider >
                {children}
            </IssueCreateProvider>
        </>
    )
}

export default layout