import { RequestedCitizenResponseTypes, RequestedContractorResponseTypes } from "@/types/moderatorTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/moderator`

export const viewAllRequestedCitizen = createAsyncThunk(
    "moderator/viewCitizen",
    async (params: { page: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/request-citizen`,
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

export const acceptCitizen = createAsyncThunk(
    "moderator/acceptCitizen",
    async (data: { requestId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/accept-citizen`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const rejectCitizen = createAsyncThunk(
    "moderator/rejectCitizen",
    async (data: {
        requestId: string,
        reason: string
    }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/reject-citizen`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const viewAllRequestedContractor = createAsyncThunk(
    "moderator/viewContractor",
    async (params: { page: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/request-constractor`,
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

export const acceptContractor = createAsyncThunk(
    "moderator/acceptContractor",
    async (data: { requestId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/accept-contractor`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const rejectContractor = createAsyncThunk(
    "moderator/rejectContractor",
    async (data: {
        requestId: string,
        reason: string
    }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/reject-contractor`, data,
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
    moderatorLoading: boolean
    requestedCitizen: RequestedCitizenResponseTypes
    requestedContractor: RequestedContractorResponseTypes
}

const initialState: initialStateTypes = {
    moderatorLoading: false,
    requestedCitizen: {
        users: [],
        pagination: {
            currentPage: 0,
            limit: 15,
            totalPages: 0,
            totalUsers: 0
        }
    },
    requestedContractor: {
        users: [],
        pagination: {
            currentPage: 0,
            limit: 15,
            totalPages: 0,
            totalUsers: 0
        }
    }
}

const moderatorSlice = createSlice({
    name: "moderator",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //view all citizen
        builder
            .addCase(viewAllRequestedCitizen.pending, (state) => {
                state.moderatorLoading = true
            })
            .addCase(viewAllRequestedCitizen.fulfilled, (state, action) => {
                state.moderatorLoading = false
                state.requestedCitizen = action.payload.data
            })
            .addCase(viewAllRequestedCitizen.rejected, (state) => {
                state.moderatorLoading = false
            })
        //accept citizen
        builder
            .addCase(acceptCitizen.fulfilled, (state, action) => {
                const requestId = action.payload.data
                state.requestedCitizen.users = state.requestedCitizen.users.filter((user) => user._id !== requestId)
                state.requestedCitizen.pagination.totalUsers -= 1
            })

        //reject citizen
        builder
            .addCase(rejectCitizen.fulfilled, (state, action) => {
                const requestId = action.payload.data
                state.requestedCitizen.users = state.requestedCitizen.users.filter((user) => user._id !== requestId)
                state.requestedCitizen.pagination.totalUsers -= 1
            })

        //view all contractor
        builder
            .addCase(viewAllRequestedContractor.pending, (state) => {
                state.moderatorLoading = true
            })
            .addCase(viewAllRequestedContractor.fulfilled, (state, action) => {
                state.moderatorLoading = false
                state.requestedContractor = action.payload.data
            })
            .addCase(viewAllRequestedContractor.rejected, (state) => {
                state.moderatorLoading = false
            })

        //accept contractor
        builder
            .addCase(acceptContractor.fulfilled, (state, action) => {
                const requestId = action.payload.data
                state.requestedContractor.users = state.requestedContractor.users.filter((user) => user._id !== requestId)
                state.requestedContractor.pagination.totalUsers -= 1
            })

        //reject contractor
        builder
            .addCase(rejectContractor.fulfilled, (state, action) => {
                const requestId = action.payload.data
                state.requestedContractor.users = state.requestedContractor.users.filter((user) => user._id !== requestId)
                state.requestedContractor.pagination.totalUsers -= 1
            })
    },
})

export default moderatorSlice.reducer