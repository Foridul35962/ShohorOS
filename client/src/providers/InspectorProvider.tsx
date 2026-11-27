"use client"

import FirstLoad from '@/components/loading/FirstLoad'
import { RootState } from '@/store/store'
import { redirect } from 'next/navigation'
import React from 'react'
import { useSelector } from 'react-redux'

const InspectorProvider = ({ children }: { children: React.ReactNode }) => {
    const { isUserFetch, user } = useSelector((state: RootState) => state.auth)
    if (isUserFetch && user?.role !== "inspector") {
        redirect("/")
    }
    return (
        <>
            {
                !isUserFetch ? <FirstLoad /> : children
            }
        </>
    )
}

export default InspectorProvider