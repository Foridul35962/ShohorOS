import { ProjectStatus } from "@/types/adminTypes";
import { verifyTypes } from "@/types/authTypes";
import { addBidResponseType, addBidType, addStaffType, ContractorIssueDetails, editBidType, GetAllIssuesForContractorResponse, GetAllStaffResponse, GetAvailableStaffResponse, MyProjectsData } from "@/types/contractorTypes";
import { IssueCategory } from "@/types/issueTypes";
import { ContractorProject } from "@/types/projectTypes";
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

export const resetBid = createAsyncThunk(
    "contractor/reset-bid",
    async (data: {
        bidId: string
        auctionId: string
    }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/reset-bid`, data, {
                withCredentials: true,
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllProjects = createAsyncThunk(
    "contractor/allProjects",
    async (params: {
        page: string,
        category?: IssueCategory,
        projectStatus?: ProjectStatus
    }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-projects`,
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

export const getContractorProject = createAsyncThunk(
    "contractor/getProject",
    async (data: { projectId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/project/${data.projectId}`,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const startProject = createAsyncThunk(
    "contractor/startProject",
    async (data: {
        projectId: string,
        staffId: string,
        startDate: string
    }, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/start-project`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const addStaff = createAsyncThunk(
    "contractor/addStaff",
    async (data: addStaffType, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/add-staff`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const verifyStaff = createAsyncThunk(
    "contractor/verifyStaff",
    async (data: verifyTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/verify-add-staff`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const getAllStaff = createAsyncThunk(
    "contractor/allStaff",
    async (params: {
        page: number,
        name?: string,
        district?: string,
        workingProject?: boolean
    }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-staff`, {
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

export const getStaffName = createAsyncThunk(
    "contractor/staffName",
    async (params: {
        page: number,
        name: string,
        district?: string
    }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/staff/${encodeURIComponent(params.name)}`,
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

interface initialStateType {
    allIssues: GetAllIssuesForContractorResponse
    issue: ContractorIssueDetails | null
    allProject: MyProjectsData
    project: ContractorProject | null
    allStaff: GetAllStaffResponse | null
    allStaffName: GetAvailableStaffResponse
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
    issue: null,
    allProject: {
        projects: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalProjects: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false
        }
    },
    project: null,
    allStaff: null,
    allStaffName: {
        staff: [],
        pagination: {
            currentPage: 0,
            limit: 0,
            totalPages: 0,
            totalStaff: 0
        }
    }
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
        //reset bids
        builder
            .addCase(resetBid.fulfilled, (state, action) => {
                const { bidId, status } = action.payload.data
                if (state.issue?.myBid?._id === bidId && state.issue && state.issue.myBid) {
                    state.issue.myBid.status = status
                }
            })
        // get all project
        builder
            .addCase(getAllProjects.fulfilled, (state, action) => {
                state.allProject = action.payload.data
            })
        //get project
        builder
            .addCase(getContractorProject.fulfilled, (state, action) => {
                state.project = action.payload.data
            })
        //start project
        builder
            .addCase(startProject.fulfilled, (state, action) => {
                const { projectId, staff, startDate } = action.payload.data
                if (!state.project || state.project._id !== projectId) {
                    return
                }
                state.project.projectStaff = {
                    _id: staff._id,
                    email: staff.email,
                    name: staff.name
                }
                state.project.plannedStartDate = startDate
            })
        // get all staff
        builder
            .addCase(getAllStaff.fulfilled, (state, action) => {
                state.allStaff = action.payload.data
            })
        // get all staff name
        builder
            .addCase(getStaffName.fulfilled, (state, action) => {
                state.allStaffName = action.payload.data
            })
    },
})

export default contractorSlice.reducer