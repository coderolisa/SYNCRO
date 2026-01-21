"use client"

import { TrendingUp, AlertCircle, Lightbulb, ArrowLeft } from "lucide-react"

interface InsightsPageProps {
  insights: any[]
  totalSpend: number
  onClose: () => void
  darkMode?: boolean
}

export default function InsightsPage({ insights, totalSpend, onClose, darkMode }: InsightsPageProps) {
  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#1E2A35]" : "bg-[#F9F6F2]"}`}>
      {/* Header */}
      <div className={`border-b ${darkMode ? "border-[#374151] bg-[#2D3748]" : "border-gray-200 bg-white"}`}>
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button
                onClick={onClose}
                className={`p-2 ${darkMode ? "hover:bg-[#374151]" : "hover:bg-gray-100"} rounded-lg transition-colors`}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-3xl font-bold ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>Detailed Insights</h1>
            </div>
            <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Comprehensive analysis of your AI subscription spending and recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        {/* Spending Card */}
        <div
          className={`mb-8 p-6 ${darkMode ? "bg-[#2D3748] border border-[#374151]" : "bg-[#1E2A35] text-white"} rounded-lg`}
        >
          <p className={`${darkMode ? "text-gray-400" : "text-gray-300"} text-sm mb-2`}>This Month's AI Spend</p>
          <h2 className={`text-5xl font-bold ${darkMode ? "text-white" : ""} mb-2`}>${totalSpend.toFixed(2)}</h2>
          <p className={`${darkMode ? "text-gray-400" : "text-gray-400"} text-sm`}>12% increase from last month</p>
        </div>

        {/* Insights Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          <div
            className={`p-6 ${darkMode ? "bg-[#2D3748] border border-[#FFD166]/30" : "bg-white border border-[#FFD166]"} rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <TrendingUp className={`w-6 h-6 ${darkMode ? "text-[#FFD166]" : "text-[#FFD166]"} mt-1 flex-shrink-0`} />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>Spend Increases</h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Your spend increased 18% this month - mostly from image generation tools like Midjourney and DALL-E.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 ${darkMode ? "bg-[#2D3748] border border-[#007A5C]/30" : "bg-white border border-[#007A5C]"} rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <Lightbulb className={`w-6 h-6 ${darkMode ? "text-[#007A5C]" : "text-[#007A5C]"} mt-1 flex-shrink-0`} />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>Optimization Tip</h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Consider consolidating your image generation tools to save costs. You're currently paying for 3
                  similar services.
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 ${darkMode ? "bg-[#2D3748] border border-[#E86A33]/30" : "bg-white border border-[#E86A33]"} rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-6 h-6 ${darkMode ? "text-[#E86A33]" : "text-[#E86A33]"} mt-1 flex-shrink-0`} />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>New Detection</h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  We detected a new Perplexity Pro subscription in your email. Would you like to add it to your
                  dashboard?
                </p>
              </div>
            </div>
          </div>

          <div
            className={`p-6 ${darkMode ? "bg-[#2D3748] border border-[#FFD166]/30" : "bg-white border border-[#FFD166]"} rounded-lg`}
          >
            <div className="flex items-start gap-3">
              <AlertCircle className={`w-6 h-6 ${darkMode ? "text-[#FFD166]" : "text-[#FFD166]"} mt-1 flex-shrink-0`} />
              <div>
                <h3 className={`font-semibold mb-2 ${darkMode ? "text-white" : "text-[#1E2A35]"}`}>
                  Upcoming Renewals
                </h3>
                <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                  3 subscriptions are expiring in the next 7 days. Make sure to renew them to avoid service
                  interruptions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
