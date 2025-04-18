"use client"

import { useState, useEffect } from "react"
import { collection, query, getDocs, addDoc, orderBy, limit, Timestamp, doc, deleteDoc } from "firebase/firestore"
import { db } from "@/firebase"

export interface TipHistory {
  id: string
  totalTips: number
  salesTax: number
  netTips: number
  remainder: number
  date: Date
  employeeData: Record<string, { hours: number; deservedTip: number }>
}

export function useHistory() {
  const [history, setHistory] = useState<TipHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch history
  const fetchHistory = async () => {
    setLoading(true)
    try {
      console.log("Fetching tip history from Firestore...")
      const historyQuery = query(
        collection(db, "history"),
        orderBy("date", "desc"),
        limit(50), // Limit to the most recent 50 entries
      )
      const snapshot = await getDocs(historyQuery)

      const historyList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date(),
      })) as TipHistory[]

      console.log(`Found ${historyList.length} history entries`)
      setHistory(historyList)
      setError(null)
    } catch (err) {
      console.error("Error fetching history:", err)
      setError("Failed to load history: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  // Save tip calculation
  const saveTipCalculation = async (data: Omit<TipHistory, "id" | "date">) => {
    try {
      const docRef = await addDoc(collection(db, "history"), {
        ...data,
        date: Timestamp.now(),
      })

      console.log("Tip calculation saved with ID:", docRef.id)

      // Refresh the history list
      fetchHistory()
      return docRef.id
    } catch (err) {
      console.error("Error saving tip calculation:", err)
      throw new Error("Failed to save tip calculation")
    }
  }

  // Delete history entry
  const deleteHistoryEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, "history", id))
      console.log("History entry deleted with ID:", id)

      // Update local state to remove the deleted entry
      setHistory((prevHistory) => prevHistory.filter((entry) => entry.id !== id))

      return true
    } catch (err) {
      console.error("Error deleting history entry:", err)
      throw new Error("Failed to delete history entry")
    }
  }

  // Load history on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      fetchHistory()
    }
  }, [])

  return {
    history,
    loading,
    error,
    fetchHistory,
    saveTipCalculation,
    deleteHistoryEntry,
  }
}
