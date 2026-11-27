import { CitizenDashboardData } from "@/types/dashboardTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/dashboard`

export const citizenDashboard = createAsyncThunk(
    "dashboard/citizen",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/citizen`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export interface initialStateTypes {
    citizen: CitizenDashboardData | null
}

const initialState: initialStateTypes = {
    citizen: null
}

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(citizenDashboard.fulfilled, (state, action) => {
                state.citizen = action.payload.data
            })
    },
})

export default dashboardSlice.reducer