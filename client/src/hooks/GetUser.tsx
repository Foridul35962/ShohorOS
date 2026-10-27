"use client"

import { fetchUser } from '@/store/slice/authSlice'
import { AppDispatch, RootState } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

const GetUser = () => {
    const dispatch = useDispatch<AppDispatch>()
    const { user } = useSelector((state: RootState) => state.auth)
    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(fetchUser(null))
            } catch (error) {
            }
        }
        if (!user) {
            fetch()
        }
    }, [])
    return null
}

export default GetUser