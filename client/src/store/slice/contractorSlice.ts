import { addBidResponseType, addBidType, ContractorIssueDetails, editBidType, GetAllIssuesForContractorResponse } from "@/types/contractorTypes";
import { IssueCategory } from "@/types/issueTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/contractor`

export const getAllIssuesForContractor = createAsyncThunk(
    "contractor/all-issue",
    async (params: {
        page: string,
        title?: string,
        category?: IssueCategory,
        district?: string
    }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/issues`, {
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

export const getIssueForContractor = createAsyncThunk(
    "contractor/issue",
    async (data: {
        issueId: string
    }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/issue/${data.issueId}`, {
                withCredentials: true,
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const addBid = createAsyncThunk(
    "contractor/add-bid",
    async (data: addBidType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-bid`, data, {
                withCredentials: true,
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const editBid = createAsyncThunk(
    "contractor/edit-bid",
    async (data: editBidType, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/edit-bid`, data, {
                withCredentials: true,
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const withdowBid = createAsyncThunk(
    "contractor/withdow-bid",
    async (data: {
        bidId: string
        auctionId: string
    }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/withdrow-bid`, data, {
                withCredentials: true,
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType {
    allIssues: GetAllIssuesForContractorResponse
    issue: ContractorIssueDetails | null
}

const initialState: initialStateType = {
    allIssues: {
        issues: [],
        pagination: {
            currentPage: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 0,
            totalIssues: 0,
            totalPages: 0
        }
    },
    issue: null
}

const contractorSlice = createSlice({
    name: "contractor",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        //all issues
        builder
            .addCase(getAllIssuesForContractor.fulfilled, (state, action) => {
                state.allIssues = action.payload.data
            })
        //get issues
        builder
            .addCase(getIssueForContractor.fulfilled, (state, action) => {
                state.issue = action.payload.data
            })
        //add bid
        builder
            .addCase(addBid.fulfilled, (state, action) => {
                const bid: addBidResponseType = action.payload.data
                if (!state.issue) {
                    return
                }
                if (state.issue.auction._id === bid.auctionId) {
                    state.issue.myBid = {
                        _id: bid._id,
                        estimatedDurationDays: Number(bid.estimatedDurationDays),
                        proposedBudget: bid.proposedBudget,
                        status: bid.status as NonNullable<ContractorIssueDetails["myBid"]>["status"],
                        submittedAt: bid.submittedAt,
                        workPlan: bid.workPlan,
                    };
                }
            })
        //edit bid
        builder
            .addCase(editBid.fulfilled, (state, action) => {
                const bid = action.payload.data;

                if (
                    state.issue &&
                    state.issue.auction._id === bid.auctionId
                ) {
                    state.issue.myBid = {
                        _id: bid._id,
                        proposedBudget: bid.proposedBudget,
                        workPlan: bid.workPlan,
                        estimatedDurationDays: bid.estimatedDurationDays,
                        status: bid.status,
                        submittedAt: bid.submittedAt,
                    };
                }
            })
        builder
            .addCase(withdowBid.fulfilled, (state, action) => {
                const { bidId, status } = action.payload.data
                if (state.issue?.myBid?._id === bidId && state.issue && state.issue.myBid) {
                    state.issue.myBid.status = status
                }
            })
    },
})

export default contractorSlice.reducer