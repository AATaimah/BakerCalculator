"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Trash2, Loader2, RefreshCw, UserPlus, AlertCircle } from "lucide-react"
import { PageLayout } from "@/components/layout/page-layout"
import { useEmployees } from "@/hooks/use-employees"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function EmployeesPage() {
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const { employees, loading, error, fetchEmployees, addEmployee, removeEmployee } = useEmployees()
  const [isMounted, setIsMounted] = useState(false)

  // Handle client-side rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEmployeeName.trim()) return

    setIsAdding(true)
    try {
      await addEmployee(newEmployeeName.trim())
      setNewEmployeeName("")
      toast.success("Employee Added",{
      description: `${newEmployeeName} has been added successfully.`,
      })
    } catch {
      toast.error("Error",{
        description: "Failed to add employee. Please try again.",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveEmployee = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove ${name}?`)) return

    try {
      await removeEmployee(id)
      toast.success("Employee Removed",{
        description: `${name} has been removed successfully.`,
      })
    } catch {
      toast.error("Error",{
        description: "Failed to remove employee. Please try again.",
      })
    }
  }

  const handleRefresh = () => {
    fetchEmployees()
    toast.success("Refreshed",{
      description: "Employee list has been refreshed.",
    })
  }

  // Don't render anything on the server
  if (!isMounted) {
    return null
  }

  return (
    <PageLayout title="Manage Employees">
      <div className="max-w-3xl mx-auto">
        <Card className="shadow-card border-t-4 border-t-baker-600 animate-fadeIn">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-baker-800">Employee Management</CardTitle>
              <CardDescription>Add or remove employees from the system</CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              title="Refresh employee list"
              className="hover:bg-baker-50 hover:text-baker-700"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddEmployee} className="flex gap-2 mb-6">
              <div className="relative flex-1">
                <Input
                  placeholder="Enter employee name"
                  value={newEmployeeName}
                  onChange={(e) => setNewEmployeeName(e.target.value)}
                  disabled={isAdding}
                  className="pr-10 focus-visible:ring-baker-500"
                />
              </div>
              <Button
                type="submit"
                disabled={isAdding || !newEmployeeName.trim()}
                className="bg-baker-700 hover:bg-baker-800 flex gap-2 items-center"
              >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Add Employee
              </Button>
            </form>

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
            ) : employees.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No employees found</h3>
                <p className="text-gray-500 mb-4">Add your first employee using the form above.</p>
              </div>
            ) : (
              <div className="rounded-md border overflow-hidden">
                <div className="bg-baker-50 py-3 px-4 text-sm font-medium text-baker-800 border-b">
                  <div className="grid grid-cols-[1fr,auto] gap-4">
                    <div>Employee Name</div>
                    <div>Actions</div>
                  </div>
                </div>
                <div className="divide-y">
                  {employees.map((employee) => (
                    <div
                      key={employee.id}
                      className="grid grid-cols-[1fr,auto] gap-4 py-3 px-4 items-center hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">{employee.name}</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveEmployee(employee.id, employee.name)}
                        className="text-baker-700 hover:text-baker-800 hover:bg-baker-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  )
}
