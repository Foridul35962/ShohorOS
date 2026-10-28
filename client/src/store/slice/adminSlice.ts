import {
    addMembersTypes,
    AuctionBidsData,
    AuctionDetailsData,
    GetAllAuctionsResponse,
    IssueDetailsData,
    ProjectMonitorData,
    ViewAllMembersDataTypes
} from "@/types/adminTypes";
import { verifyTypes } from "@/types/authTypes";
import { AuctionStatus } from "@/types/contractorTypes";
import { IssueCategory } from "@/types/issueTypes";
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

export const getIssueAdminDetails = createAsyncThunk(
    "admin/getIssueDetails",
    async (data: { issueId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/issue-details/${data.issueId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const startAuction = createAsyncThunk(
    "admin/startAuction",
    async (data: { issueId: string, deadline: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/start-auction/${data.issueId}`,
                data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAuctionDetails = createAsyncThunk(
    "admin/auctionDetails",
    async (data: { auctionId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/auction-details/${data.auctionId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAuctionBids = createAsyncThunk(
    "admin/auctionBids",
    async (data: { auctionId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/auction-bits/${data.auctionId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const selectAuctionWinner = createAsyncThunk(
    "admin/auctionWinner",
    async (data: { auctionId: string, bidId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/auction-winner/${data.auctionId}`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getProjectMonitoringDetails = createAsyncThunk(
    "admin/monitor",
    async (data: { projectId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/project-monitor/${data.projectId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllAuctions = createAsyncThunk(
    "admin/getAuctions",
    async (params: {
        page: string,
        category?: IssueCategory,
        deadline?: boolean,
        status?: AuctionStatus
    }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-auctions`, {
                withCredentials: true,
                params
            })
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
    issueDetails: IssueDetailsData | null
    auctionDetails: AuctionDetailsData | null
    auctionBids: AuctionBidsData | null
    projectMonitor: ProjectMonitorData | null
    allAuctions: GetAllAuctionsResponse
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
    },
    issueDetails: null,
    auctionBids: null,
    auctionDetails: null,
    projectMonitor: null,
    allAuctions: {
        auctions: [],
        pagination: {
            hasNextPage: false,
            hasPrevPage: false,
            limit: 0,
            page: 0,
            total: 0,
            totalPages: 0
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

        //get issue details
        builder
            .addCase(getIssueAdminDetails.fulfilled, (state, action) => {
                state.issueDetails = action.payload.data
            })
        builder
            .addCase(getAuctionDetails.fulfilled, (state, action) => {
                state.auctionDetails = action.payload.data
            })
        builder
            .addCase(getAuctionBids.fulfilled, (state, action) => {
                state.auctionBids = action.payload.data
            })
        builder
            .addCase(getProjectMonitoringDetails.fulfilled, (state, action) => {
                state.projectMonitor = action.payload.data
            })
        builder
            .addCase(getAllAuctions.fulfilled, (state, action) => {
                state.allAuctions = action.payload.data
            })
    },
})

export default adminSlice.reducer