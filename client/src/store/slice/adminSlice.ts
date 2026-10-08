import { addMembersTypes } from "@/types/adminTypes";
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

interface initialStateTypes {
    adminLoading: boolean
}

const initialState: initialStateTypes = {
    adminLoading: false
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
            .addCase(deleteMembers.pending, (state) => {
                state.adminLoading = true
            })
            .addCase(deleteMembers.fulfilled, (state) => {
                state.adminLoading = false
            })
            .addCase(deleteMembers.rejected, (state) => {
                state.adminLoading = false
            })
    },
})

export default adminSlice.reducer