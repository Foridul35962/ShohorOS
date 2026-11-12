import { Inspection, ProjectMonitorData } from "@/types/adminTypes";
import { allocatedInspectorTypes, availableInspectorTypes } from "@/types/officerTypes";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";

const SERVER_URL = `${process.env.NEXT_PUBLIC_SERVER_URL}/api/officer`

export const getDepartmentProject = createAsyncThunk(
    "officer/getDepartmentProject",
    async (data: { projectId: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/project/${data.projectId}`, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

export const viewAvailableInspector = createAsyncThunk(
    "officer/view-inspector",
    async (params: { name: string }, { rejectWithValue }) => {
        try {
            const res = await axios.get(`${SERVER_URL}/available-inspector`, {
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

export const allocatedInspectorForProject = createAsyncThunk(
    "officer/allocated-inspector",
    async (data: allocatedInspectorTypes, { rejectWithValue }) => {
        try {
            const res = await axios.post(`${SERVER_URL}/allocate-inspector`, data, {
                withCredentials: true
            })
            return res.data
        } catch (error) {
            const err = error as AxiosError<any>
            return rejectWithValue(err?.response?.data || "Something went wrong")
        }
    }
)

interface initialStateTypes {
    departmentProject: ProjectMonitorData | null
    availableInspector: availableInspectorTypes | null
}

const initialState: initialStateTypes = {
    departmentProject: null,
    availableInspector: null
}

const officerSlice = createSlice({
    name: "officer",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getDepartmentProject.fulfilled, (state, action) => {
                state.departmentProject = action.payload.data
            })
        builder
            .addCase(viewAvailableInspector.fulfilled, (state, action) => {
                state.availableInspector = action.payload.data
            })
        builder
            .addCase(allocatedInspectorForProject.fulfilled, (state, action) => {
                const inspector = action.payload.data;

                if (state.departmentProject?.inspections) {
                    state.departmentProject.inspections.push({
                        _id: inspector.inspectionId,
                        inspectorId: inspector._id,
                        inspector: {
                            _id: inspector._id,
                            name: inspector.name,
                            email: inspector.email,
                            phoneNumber: inspector.phoneNumber,
                            profilePic: {
                                url: inspector.profilePic?.url,
                            },
                        },
                    } as Inspection);
                }
            })
    },
})

export default officerSlice.reducer