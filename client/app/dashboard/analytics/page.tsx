"use client"

import { useEffect, useState } from "react"
import AnalyticsPage from "@/components/pages/analytics"
import { analyticsApi, AnalyticsSummary } from "@/lib/api/analytics"
import { useTheme } from "next-themes"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, AlertTriangle } from "lucide-react"

export default function AnalyticsRoute() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { theme } = useTheme()
  const darkMode = theme === "dark"

  const fetchAnalytics = async () => {
    setError(null)
    setLoading(true)
    try {
      const data = await analyticsApi.getSummary()
      setSummary(data)
    } catch (err) {
      console.error("Failed to fetch analytics:", err)
      setError("Failed to load analytics data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="p-4 sm:p-8 space-y-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <Skeleton className="h-64 sm:h-80 w-full rounded-xl" />
          <Skeleton className="h-64 sm:h-80 w-full rounded-xl" />
        </div>
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center gap-4">
        <AlertTriangle className="h-10 w-10 text-red-500" aria-hidden="true" />
        <p className={`text-base font-medium ${darkMode ? "text-red-400" : "text-red-600"}`}>{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!summary || summary.active_subscriptions === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center gap-4">
        <BarChart3 className={`h-12 w-12 ${darkMode ? "text-gray-600" : "text-gray-300"}`} aria-hidden="true" />
        <h2 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
          No analytics yet
        </h2>
        <p className={`text-sm max-w-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          Add your first subscription to start tracking spending trends and category breakdowns.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6 sm:mb-8">
        <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>
          Spending Analytics
        </h1>
        <p className={`text-sm sm:text-base mt-1 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
          Track your subscription spend and stay within budget.
        </p>
      </div>
      <AnalyticsPage summary={summary} darkMode={darkMode} />
    </div>
  )
}
