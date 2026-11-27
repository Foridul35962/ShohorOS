"use client"

import CitizenDashboardView from "@/components/dashboard/CitizenDashboardView"
import { RootState } from "@/store/store"
import { useSelector } from "react-redux"

export default function CitizenDashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth)
  if (!user) return null

  switch (user?.role) {
    case "citizen":
      return <CitizenDashboardView />;

    // default:
      // return <Unauthorized />;
  }
}