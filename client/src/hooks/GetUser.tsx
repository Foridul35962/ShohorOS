"use client"

import { fetchUser } from '@/store/slice/authSlice'
import { AppDispatch } from '@/store/store'
import React, { useEffect } from 'react'
import { useDispatch } from 'react-redux'

const GetUser = () => {
    const dispatch = useDispatch<AppDispatch>()
    useEffect(() => {
        const fetch = async () => {
            try {
                await dispatch(fetchUser(null))
            } catch (error) {
            }
        }
        fetch()
    }, [])
    return null
}

export default GetUser