import ContractorProvider from '@/providers/ContractorProvider'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <>
            <ContractorProvider >
                {children}
            </ContractorProvider>
        </>
    )
}

export default layout