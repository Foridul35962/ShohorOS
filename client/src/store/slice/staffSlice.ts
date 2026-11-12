import { MyProjectsData } from "@/types/contractorTypes";
import { IssueCategory } from "@/types/issueTypes";
import { StaffProjectDetails } from "@/types/projectTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/staff`

export const getAllocatedProjects = createAsyncThunk(
    "staff/allProject",
    async (params: {
        page: string,
        category?: IssueCategory,
    }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/all-allocated-project`, {
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

export const getStaffProjectDetails = createAsyncThunk(
    "staff/projectDetails",
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

export const projectProgressUpdates = createAsyncThunk(
    "staff/progressUpdate",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/update-project`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const completeProject = createAsyncThunk(
    "staff/project-complete",
    async (data: FormData, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/submit-project`, data,
                { withCredentials: true }
            )
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateType {
    allProject: MyProjectsData
    project: StaffProjectDetails | null
}

const initialState: initialStateType = {
    allProject: {
        projects: [],
        pagination: {
            currentPage: 0,
            hasNextPage: false,
            hasPrevPage: false,
            limit: 0,
            totalPages: 0,
            totalProjects: 0
        }
    },
    project: null
}

const staffSlice = createSlice({
    name: "staff",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllocatedProjects.fulfilled, (state, action) => {
                state.allProject = action.payload.data
            })
        builder
            .addCase(getStaffProjectDetails.fulfilled, (state, action) => {
                state.project = action.payload.data
            })
        builder
            .addCase(projectProgressUpdates.fulfilled, (state, action) => {
                if (!state.project) {
                    return
                }
                state.project.progressUpdates.push(action.payload.data)
            })
        builder
            .addCase(completeProject.fulfilled, (state, action) => {
                if (!state.project) {
                    return
                }
                state.project.completionSubmission = action.payload.data
            })
    },
})

export default staffSlice.reducer