import { configureStore } from "@reduxjs/toolkit";
import authSlice from "@/store/slice/authSlice"
import adminSlice from "@/store/slice/adminSlice"
import moderatorSlice from "@/store/slice/moderatorSlice"

const store = configureStore({
    reducer: {
        auth: authSlice,
        admin: adminSlice,
        moderator: moderatorSlice,
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store