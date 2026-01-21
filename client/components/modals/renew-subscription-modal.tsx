"use client"

import { X, ArrowRight } from "lucide-react"

interface RenewSubscriptionModalProps {
  subscription: any
  onClose: () => void
  onRenew: () => void
}

export default function RenewSubscriptionModal({ subscription, onClose, onRenew }: RenewSubscriptionModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Renew Subscription</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl">
              {subscription.icon}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{subscription.name}</h3>
              <p className="text-sm text-orange-600 font-medium">Expires in {subscription.renewsIn} days</p>
            </div>
          </div>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Renewal amount</span>
              <span className="font-semibold text-gray-900">${subscription.price}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Billing cycle</span>
              <span className="font-semibold text-gray-900">Monthly</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between">
              <span className="font-medium text-gray-900">Total</span>
              <span className="font-bold text-gray-900">${subscription.price}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRenew}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            Renew Now
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg hover:border-black transition-colors font-medium text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
