import { citizenRegiTypes, contractorRegistrationTypes, resendOtpTypes, resetPassTypes, userTypes, verifyTypes } from "@/types/authTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/auth`

export const registrationCitizen = createAsyncThunk(
    "auth/citizen-regi",
    async (data: citizenRegiTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/citizen-regi`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
);

export const verifyRegistrationCitizen = createAsyncThunk(
    "auth/verifyCitizen",
    async (data: verifyTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/citizen-regi-veri`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const forgetPassword = createAsyncThunk(
    "auth/forgetPass",
    async (data: { email: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/forget-pass`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const verifyForgatePassword = createAsyncThunk(
    "auth/verfiyForgatePass",
    async (data: verifyTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/verify-forget-pass`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const resetPassword = createAsyncThunk(
    "auth/resetPass",
    async (data: resetPassTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/reset-pass`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const login = createAsyncThunk(
    "auth/login",
    async (data: resetPassTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/login`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const logout = createAsyncThunk(
    "auth/logout",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/logout`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const constractorRegistration = createAsyncThunk(
    "autu/contractorRegi",
    async (data: contractorRegistrationTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/contractor-regi`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const constractorRegiVerify = createAsyncThunk(
    "auth/contractorRegiVerify",
    async (data: verifyTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/contractor-regi-veri`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const fetchUser = createAsyncThunk(
    "auth/fetchUser",
    async (_: null, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/me`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const resendOtp = createAsyncThunk(
    "auth/resendOtp",
    async (data: resendOtpTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/resend-otp`, data)
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateTypes {
    authLoading: boolean
    isUserFetch: boolean
    user: userTypes | null
}

const initialState: initialStateTypes = {
    authLoading: false,
    isUserFetch: false,
    user: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //registration citizen
        builder
            .addCase(registrationCitizen.pending, (state) => {
                state.authLoading = true
            })
            .addCase(registrationCitizen.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(registrationCitizen.rejected, (state) => {
                state.authLoading = false
            })

        //verify citizen registration
        builder
            .addCase(verifyRegistrationCitizen.pending, (state) => {
                state.authLoading = true
            })
            .addCase(verifyRegistrationCitizen.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(verifyRegistrationCitizen.rejected, (state) => {
                state.authLoading = false
            })

        //forget password
        builder
            .addCase(forgetPassword.pending, (state) => {
                state.authLoading = true
            })
            .addCase(forgetPassword.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(forgetPassword.rejected, (state) => {
                state.authLoading = false
            })

        //verify forget password
        builder
            .addCase(verifyForgatePassword.pending, (state) => {
                state.authLoading = true
            })
            .addCase(verifyForgatePassword.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(verifyForgatePassword.rejected, (state) => {
                state.authLoading = false
            })

        //reset password
        builder
            .addCase(resetPassword.pending, (state) => {
                state.authLoading = true
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(resetPassword.rejected, (state) => {
                state.authLoading = false
            })

        //login
        builder
            .addCase(login.pending, (state) => {
                state.authLoading = true
            })
            .addCase(login.fulfilled, (state, action) => {
                state.authLoading = false
                state.isUserFetch = true
                state.user = action.payload.data
            })
            .addCase(login.rejected, (state) => {
                state.authLoading = false
            })

        //logout
        builder
            .addCase(logout.pending, (state) => {
                state.authLoading = true
            })
            .addCase(logout.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(logout.rejected, (state) => {
                state.authLoading = false
            })

        //constractor registration
        builder
            .addCase(constractorRegistration.pending, (state) => {
                state.authLoading = true
            })
            .addCase(constractorRegistration.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(constractorRegistration.rejected, (state) => {
                state.authLoading = false
            })

        //verify constractor registration
        builder
            .addCase(constractorRegiVerify.pending, (state) => {
                state.authLoading = true
            })
            .addCase(constractorRegiVerify.fulfilled, (state) => {
                state.authLoading = false
            })
            .addCase(constractorRegiVerify.rejected, (state) => {
                state.authLoading = false
            })

        //fetch user
        builder
            .addCase(fetchUser.pending, (state) => {
                state.authLoading = true
            })
            .addCase(fetchUser.fulfilled, (state, action) => {
                state.authLoading = false
                state.isUserFetch = true
                state.user = action.payload.data
            })
            .addCase(fetchUser.rejected, (state) => {
                state.authLoading = false
                state.isUserFetch = true
            })
    }
})

export default authSlice.reducer