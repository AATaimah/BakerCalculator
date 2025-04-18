"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PageLayout } from "@/components/layout/page-layout"
import { useHistory, type TipHistory } from "@/hooks/use-history"
import { Loader2, RefreshCw, Calendar, DollarSign, AlertCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "sonner"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { PasswordCheck } from "@/components/password-check"

export default function HistoryPage() {
  const { history, loading, error, fetchHistory, deleteHistoryEntry } = useHistory()
  const [isMounted, setIsMounted] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<TipHistory | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<TipHistory | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Handle client-side rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleRefresh = () => {
    fetchHistory()
    toast.success("Refreshed", {
      description: "History list has been refreshed.",
    })
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const handleDeleteClick = (entry: TipHistory, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent selecting the entry when clicking delete
    setEntryToDelete(entry)
    setDeleteConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!entryToDelete) return

    setIsDeleting(true)
    try {
      await deleteHistoryEntry(entryToDelete.id)

      // If the deleted entry was selected, clear the selection
      if (selectedEntry?.id === entryToDelete.id) {
        setSelectedEntry(null)
      }

      toast.success("Entry Deleted", {
        description: "The history entry has been deleted successfully.",
      })
    } catch (error) {
      toast.error("Error", {
        description: "Failed to delete the history entry. Please try again.",
      })
      console.error("Error deleting history entry:", error)
    } finally {
      setIsDeleting(false)
      setDeleteConfirmOpen(false)
      setEntryToDelete(null)
    }
  }

  // Don't render anything on the server
  if (!isMounted) {
    return null
  }

  const content = (
    <PageLayout title="Tip History">
      <div className="max-w-7xl mx-auto">
        <div className="grid gap-6 md:grid-cols-[1fr,2fr]">
          {/* History List */}
          <Card className="shadow-card border-t-4 border-t-baker-600 animate-fadeIn">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-baker-800">Tip History</CardTitle>
                <CardDescription>View past tip calculations</CardDescription>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleRefresh}
                title="Refresh history"
                className="hover:bg-baker-50 hover:text-baker-700"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-baker-800" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No history found</h3>
                  <p className="text-gray-500 mb-4">Save a tip calculation to see it here.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                  {history.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-3 rounded-md border cursor-pointer transition-colors ${
                        selectedEntry?.id === entry.id
                          ? "bg-baker-50 border-baker-200"
                          : "hover:bg-gray-50 border-gray-200"
                      }`}
                      onClick={() => setSelectedEntry(entry)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="font-medium">${entry.totalTips.toFixed(2)}</div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-gray-500">{formatDate(entry.date)}</div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50"
                            onClick={(e) => handleDeleteClick(entry, e)}
                            title="Delete entry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {Object.keys(entry.employeeData).length} employees
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* History Details */}
          <Card className="shadow-card border-t-4 border-t-baker-600 animate-fadeIn">
            <CardHeader>
              <CardTitle className="text-2xl text-baker-800">Tip Details</CardTitle>
              <CardDescription>
                {selectedEntry
                  ? `Calculation from ${formatDate(selectedEntry.date)}`
                  : "Select a calculation to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedEntry ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <DollarSign className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No calculation selected</h3>
                  <p className="text-gray-500">Select a calculation from the list to view details.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-2 p-4 bg-baker-50 rounded-md border border-baker-100">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Tips:</span>
                      <span className="font-bold">${selectedEntry.totalTips.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sales tax set aside:</span>
                      <span className="font-bold">${selectedEntry.salesTax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tips distributed:</span>
                      <span className="font-bold">${selectedEntry.netTips.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Remainder:</span>
                      <span className="font-bold">${selectedEntry.remainder.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-lg mb-3">Employee Distribution</h3>
                    <div className="overflow-x-auto rounded-md border">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-baker-50 border-b">
                            <th className="text-left p-3 text-baker-800 font-medium">Employee</th>
                            <th className="text-center p-3 text-baker-800 font-medium">Hours</th>
                            <th className="text-right p-3 text-baker-800 font-medium">Tip Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {Object.entries(selectedEntry.employeeData).map(([name, data], index) => (
                            <tr key={index} className="hover:bg-gray-50 transition-colors">
                              <td className="p-3 font-medium">{name}</td>
                              <td className="text-center p-3">{data.hours}</td>
                              <td className="text-right p-3 font-mono">${data.deservedTip.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete History Entry"
        description={`Are you sure you want to delete this tip calculation from ${
          entryToDelete ? formatDate(entryToDelete.date) : ""
        }? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
      />
    </PageLayout>
  )

  return <PasswordCheck>{content}</PasswordCheck>
}
