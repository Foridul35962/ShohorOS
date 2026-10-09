import { addMembersTypes, ViewAllMembersDataTypes } from "@/types/adminTypes";
import { verifyTypes } from "@/types/authTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/admin`

export const addMembers = createAsyncThunk(
    "admin/addMember",
    async (data: addMembersTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-members`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const verifyMembers = createAsyncThunk(
    "admin/verifyMembers",
    async (data: verifyTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/verify-member`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const deleteMembers = createAsyncThunk(
    "admin/deleteMembers",
    async (data: { userId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.delete(`${SERVER_URL}/member/${data.userId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const viewAllMembers = createAsyncThunk(
    "admin/viewAllMembers",
    async (params: {
        name?: string,
        page: string,
        role?: "moderator" | "department-officer" | "city-admin" | "inspector"
    }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-member`,
                {
                    withCredentials: true,
                    params
                }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateTypes {
    adminLoading: boolean
    allMembers: ViewAllMembersDataTypes
}

const initialState: initialStateTypes = {
    adminLoading: false,
    allMembers: {
        users: [],
        pagination: {
            currentPage: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 0,
            totalPages: 0,
            totalUsers: 0
        }
    }
}

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //add members
        builder
            .addCase(addMembers.pending, (state) => {
                state.adminLoading = true
            })
            .addCase(addMembers.fulfilled, (state) => {
                state.adminLoading = false
            })
            .addCase(addMembers.rejected, (state) => {
                state.adminLoading = false
            })

        //verify add members
        builder
            .addCase(verifyMembers.pending, (state) => {
                state.adminLoading = true
            })
            .addCase(verifyMembers.fulfilled, (state) => {
                state.adminLoading = false
            })
            .addCase(verifyMembers.rejected, (state) => {
                state.adminLoading = false
            })

        //verify add members
        builder
            .addCase(deleteMembers.fulfilled, (state, action) => {
                const userId = action.payload.data
                state.allMembers.users = state.allMembers.users.filter((user) => user._id !== userId)
            })

        //view all members
        builder
            .addCase(viewAllMembers.pending, (state) => {
                state.adminLoading = true
            })
            .addCase(viewAllMembers.fulfilled, (state, action) => {
                state.adminLoading = false
                state.allMembers = action.payload.data
            })
            .addCase(viewAllMembers.rejected, (state) => {
                state.adminLoading = false
            })
    },
})

export default adminSlice.reducer