"use client"

import { X, Undo2, Redo2, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface UndoHistoryPanelProps {
  history: Array<{ action: string; timestamp: number; isCurrent: boolean }>
  onClose: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  darkMode: boolean
}

export default function UndoHistoryPanel({
  history,
  onClose,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  darkMode,
}: UndoHistoryPanelProps) {
  return (
    <div
      className={`fixed right-0 top-0 h-full w-80 ${darkMode ? "bg-[#2D3748] border-[#374151]" : "bg-white border-gray-200"} border-l shadow-lg z-40 flex flex-col`}
    >
      <div
        className={`flex items-center justify-between p-6 border-b ${darkMode ? "border-[#374151]" : "border-gray-200"}`}
      >
        <h3 className={`text-lg font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>History</h3>
        <button onClick={onClose} className={`p-1 ${darkMode ? "hover:bg-[#374151]" : "hover:bg-gray-100"} rounded-lg`}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex gap-2 p-4 border-b ${darkMode ? 'border-[#374151]' : 'border-gray-200'}">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
            canUndo
              ? darkMode
                ? "bg-[#FFD166] text-[#1E2A35] hover:bg-[#FFD166]/90"
                : "bg-[#1E2A35] text-white hover:bg-[#2D3748]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Undo2 className="w-4 h-4" />
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg ${
            canRedo
              ? darkMode
                ? "bg-[#FFD166] text-[#1E2A35] hover:bg-[#FFD166]/90"
                : "bg-[#1E2A35] text-white hover:bg-[#2D3748]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Redo
          <Redo2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-2">
          {history.map((entry, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                entry.isCurrent
                  ? darkMode
                    ? "bg-[#FFD166]/10 border-[#FFD166]"
                    : "bg-blue-50 border-blue-200"
                  : darkMode
                    ? "bg-[#1E2A35] border-[#374151]"
                    : "bg-gray-50 border-gray-200"
              }`}
            >
              <div className="flex items-start gap-2">
                <Clock className={`w-4 h-4 mt-0.5 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${darkMode ? "text-white" : "text-gray-900"}`}>{entry.action}</p>
                  <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                  </p>
                </div>
                {entry.isCurrent && (
                  <span className={`text-xs font-medium ${darkMode ? "text-[#FFD166]" : "text-blue-600"}`}>
                    Current
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
