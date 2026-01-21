"use client"

import { X, TrendingUp, AlertCircle, Lightbulb } from "lucide-react"

interface InsightsModalProps {
  insights: any[]
  totalSpend: number
  onClose: () => void
}

export default function InsightsModal({ insights, totalSpend, onClose }: InsightsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Detailed Insights</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-black rounded-lg text-white">
          <p className="text-gray-300 text-sm mb-2">This Month's AI Spend</p>
          <h3 className="text-4xl font-bold">${totalSpend.toFixed(2)}</h3>
          <p className="text-gray-400 text-sm mt-2">12% increase from last month</p>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Spend Increases</h4>
                <p className="text-sm text-gray-600">
                  Your spend increased 18% this month - mostly from image generation tools like Midjourney and DALL-E.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Optimization Tip</h4>
                <p className="text-sm text-gray-600">
                  Consider consolidating your image generation tools to save costs. You're currently paying for 3
                  similar services.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">New Detection</h4>
                <p className="text-sm text-gray-600">
                  We detected a new Perplexity Pro subscription in your email. Would you like to add it to your
                  dashboard?
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Upcoming Renewals</h4>
                <p className="text-sm text-gray-600">
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
