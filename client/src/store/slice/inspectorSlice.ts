import { GetAllocatedAllProjectResponse, GetAllocatedProjectDetailsResponse, setReportType } from "@/types/inspectorTypes";
import { IssueCategory } from "@/types/issueTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/inspector`

export const getAllocatedInspectionProject = createAsyncThunk(
    "inspector/allocatedProject",
    async (params: {
        page: string,
        category: IssueCategory,
        reviewed: boolean
    }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/allocated-project`, {
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

export const getAllocatedInspectionProjectDetails = createAsyncThunk(
    "inspector/projectDetails",
    async (data: { projectId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/allocated-project-details/${data.projectId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const setReport = createAsyncThunk(
    "inspector/setReport",
    async (data: setReportType, { rejectWithValue }) => {
        try {
            const res = await axios.patch(`${SERVER_URL}/set-report`, data,
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
    allAllocatedProject: GetAllocatedAllProjectResponse
    projectDetails: GetAllocatedProjectDetailsResponse | null
}

const initialState: initialStateType = {
    allAllocatedProject: {
        projects: [],
        pagination: {
            limit: 0,
            page: 0,
            total: 0,
            totalPages: 0
        }
    },
    projectDetails: null
}

const inspectorSlice = createSlice({
    name: "inspector",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllocatedInspectionProject.fulfilled, (state, action) => {
                state.allAllocatedProject = action.payload.data
            })
        builder
            .addCase(getAllocatedInspectionProjectDetails.fulfilled, (state, action) => {
                state.projectDetails = action.payload.data
            })
        builder
            .addCase(setReport.fulfilled, (state, action) => {
                const { inspectorId, findings, image, result, correctionNote, reinspectionRequired } = action.payload.data
                const inspectionId = action.payload.data._id
                if (!state.projectDetails) {
                    return
                }
                const idx = state.projectDetails.inspections.findIndex(
                    (inspection) => inspection._id === inspectionId && inspection.inspectorId === inspectorId
                )
                if (idx < 0) {
                    return
                }
                state.projectDetails.inspections[idx].findings = findings
                state.projectDetails.inspections[idx].image = image
                state.projectDetails.inspections[idx].result = result
                state.projectDetails.inspections[idx].correctionNote = correctionNote
                state.projectDetails.inspections[idx].reinspectionRequired = reinspectionRequired
            })
    },
})

export default inspectorSlice.reducer