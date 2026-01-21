"use client"

import { useState, useCallback, useEffect } from "react"

const UNDO_TIMEOUT = 10000 // 10 seconds
const MAX_HISTORY_SIZE = 50

interface HistoryEntry {
  state: any
  timestamp: number
  action: string
}

export function useUndoHistory(initialState: any) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { state: initialState, timestamp: Date.now(), action: "initial" },
  ])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [pendingUndo, setPendingUndo] = useState<NodeJS.Timeout | null>(null)

  // Persist history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("undo_history", JSON.stringify(history))
      localStorage.setItem("undo_index", String(historyIndex))
    } catch (error) {
      console.error("[v0] Failed to persist undo history:", error)
    }
  }, [history, historyIndex])

  // Restore history from localStorage on mount
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("undo_history")
      const savedIndex = localStorage.getItem("undo_index")

      if (savedHistory && savedIndex) {
        setHistory(JSON.parse(savedHistory))
        setHistoryIndex(Number.parseInt(savedIndex, 10))
      }
    } catch (error) {
      console.error("[v0] Failed to restore undo history:", error)
    }
  }, [])

  const addToHistory = useCallback(
    (newState: any, action: string) => {
      setHistory((prev) => {
        // Remove any history after current index
        const newHistory = prev.slice(0, historyIndex + 1)

        // Add new entry
        newHistory.push({
          state: newState,
          timestamp: Date.now(),
          action,
        })

        // Limit history size
        if (newHistory.length > MAX_HISTORY_SIZE) {
          return newHistory.slice(-MAX_HISTORY_SIZE)
        }

        return newHistory
      })

      setHistoryIndex((prev) => Math.min(prev + 1, MAX_HISTORY_SIZE - 1))
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      return history[historyIndex - 1].state
    }
    return null
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      return history[historyIndex + 1].state
    }
    return null
  }, [history, historyIndex])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  const getHistoryList = useCallback(() => {
    return history.map((entry, index) => ({
      action: entry.action,
      timestamp: entry.timestamp,
      isCurrent: index === historyIndex,
    }))
  }, [history, historyIndex])

  return {
    addToHistory,
    undo,
    redo,
    canUndo,
    canRedo,
    currentState: history[historyIndex]?.state,
    getHistoryList,
  }
}
