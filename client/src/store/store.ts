import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/store/slice/authSlice"
import adminSlice from "@/store/slice/adminSlice"
import moderatorSlice from "@/store/slice/moderatorSlice"
import issueSlice from "@/store/slice/issueSlice"
import contractorSlice from "@/store/slice/contractorSlice"
import notificationSlice from "@/store/slice/notificationSlice"
import staffSlice from "@/store/slice/staffSlice"

const store = configureStore({
    reducer: {
        auth: authSlice,
        admin: adminSlice,
        moderator: moderatorSlice,
        issue: issueSlice,
        contractor: contractorSlice,
        notification: notificationSlice,
        staff: staffSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store