import IssueDetailsViewProvider from '@/providers/IssueDetailsViewProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <IssueDetailsViewProvider >
                {children}
            </IssueDetailsViewProvider>
        </>
    )
}

export default layout