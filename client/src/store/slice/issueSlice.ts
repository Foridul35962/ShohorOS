import { GetAllIssueResponse, IssueCategory, IssueStatus, IssueTypes } from "@/types/issueTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { acceptIssue, rejectIssue } from "./moderatorSlice";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/issue`

export const createIssues = createAsyncThunk(
    "issue/create",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/create`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getIssueForPublic = createAsyncThunk(
    "issue/publicIssue",
    async (data: { issueId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/public/${data.issueId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllIssues = createAsyncThunk(
    "issue/all",
    async (params: {
        page: string,
        category?: IssueCategory,
        status?: IssueStatus,
        priority?: 1 | 2 | 3 | 4 | 5,
        myIssue?: boolean
    },
        { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-issues`,
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
    issueLoading: Boolean
    isDuplicateIssue: Boolean
    issue: IssueTypes | null
    allIssue: GetAllIssueResponse
}

const initialState: initialStateTypes = {
    issueLoading: false,
    isDuplicateIssue: false,
    issue: null,
    allIssue: {
        issues: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalIssues: 0,
            totalPages: 0
        }
    },
}

const issueSlice = createSlice({
    name: "issue",
    initialState,
    reducers: {
        clearDuplicateIssue: (state) => {
            state.isDuplicateIssue = false;
        },
    },
    extraReducers: (builder) => {
        //create issue
        builder
            .addCase(createIssues.pending, (state) => {
                state.isDuplicateIssue = false
            })
            .addCase(createIssues.fulfilled, (state, action) => {
                const { issue, isDuplicate } = action.payload.data
                state.isDuplicateIssue = isDuplicate
                state.issue = issue
            })
        //get issue for public
        builder
            .addCase(getIssueForPublic.fulfilled, (state, action) => {
                state.issue = action.payload.data
            })
        //get all issue
        builder
            .addCase(getAllIssues.fulfilled, (state, action) => {
                state.allIssue = action.payload.data
            })
        // moderator accept / reject
        builder
            .addCase(acceptIssue.fulfilled, (state, action) => {
                const { issueId, priority } = action.payload.data
                if (state.issue && state.issue._id === issueId) {
                    state.issue.status = "APPROVED"
                    state.issue.priority = priority
                }
            })
            .addCase(rejectIssue.fulfilled, (state, action) => {
                const issueId = action.payload.data
                if (state.issue && state.issue._id === issueId) {
                    state.issue.status = "REJECTED"
                }
            })
    },
})

export const { clearDuplicateIssue } = issueSlice.actions
export default issueSlice.reducer