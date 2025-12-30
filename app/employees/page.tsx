"use client"

import type React from "react"

import { useEffect, useState } from "react"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { PageLayout } from "@/components/layout/page-layout"
import { useEmployees } from "@/hooks/use-employees"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { AlertCircle, GripVertical, Loader2, RefreshCw, Trash2, UserPlus } from "lucide-react"
import { toast } from "sonner"

export default function EmployeesPage() {
  const [newEmployeeName, setNewEmployeeName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const { employees, loading, error, fetchEmployees, addEmployee, removeEmployee, reorderEmployees } =
    useEmployees()
  const [isMounted, setIsMounted] = useState(false)
  const [confirmEmployee, setConfirmEmployee] = useState<{ id: string; name: string } | null>(null)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  // Handle client-side rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedName = newEmployeeName.trim()
    if (!trimmedName) {
      toast.error("Missing name", {
        description: "Enter a name before adding an employee.",
      })
      return
    }

    setIsAdding(true)
    try {
      await addEmployee(trimmedName)
      setNewEmployeeName("")
      toast.success("Employee Added", {
        description: `${trimmedName} has been added successfully.`,
      })
    } catch {
      toast.error("Error", {
        description: "Failed to add employee. Please try again.",
      })
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveEmployee = async (id: string, name: string) => {
    setConfirmEmployee({ id, name })
  }

  const confirmRemoveEmployee = async () => {
    if (!confirmEmployee) return

    const { id, name } = confirmEmployee

    try {
      await removeEmployee(id)
      toast.success("Employee Removed", {
        description: `${name} has been removed successfully.`,
      })
    } catch {
      toast.error("Error", {
        description: "Failed to remove employee. Please try again.",
      })
    } finally {
      setConfirmEmployee(null)
    }
  }

  const handleRefresh = () => {
    fetchEmployees()
    toast.success("Refreshed", {
      description: "Employee list has been refreshed.",
    })
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = employees.findIndex((employee) => employee.id === active.id)
    const newIndex = employees.findIndex((employee) => employee.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(employees, oldIndex, newIndex)
    try {
      await reorderEmployees(reordered)
      toast.success("Employee order updated")
    } catch (err) {
      console.error(err)
      toast.error("Could not update order", {
        description: err instanceof Error ? err.message : String(err),
      })
    }
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
              <CardDescription>Add, remove, or drag to reorder employees</CardDescription>
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
                disabled={isAdding}
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
                  <div className="grid grid-cols-[auto,1fr,auto] items-center gap-4">
                    <div aria-hidden className="w-4" />
                    <div>Employee Name</div>
                  </div>
                </div>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={employees.map((e) => e.id)} strategy={verticalListSortingStrategy}>
                    <div className="divide-y">
                      {employees.map((employee) => (
                        <SortableEmployeeRow
                          key={employee.id}
                          employee={employee}
                          onRemove={() => handleRemoveEmployee(employee.id, employee.name)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </CardContent>
        </Card>
        <ConfirmationDialog
          open={!!confirmEmployee}
          onOpenChange={(open) => {
            if (!open) setConfirmEmployee(null)
          }}
          title="Remove employee"
          description={`Are you sure you want to remove ${confirmEmployee?.name ?? "this employee"}?`}
          onConfirm={confirmRemoveEmployee}
          confirmText="Remove"
          cancelText="Cancel"
        />
      </div>
    </PageLayout>
  )
}

function SortableEmployeeRow({
  employee,
  onRemove,
}: {
  employee: { id: string; name: string }
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: employee.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 transition-colors"
    >
      <button
        className="text-gray-400 hover:text-baker-700 cursor-grab active:cursor-grabbing"
        type="button"
        aria-label={`Drag ${employee.name}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="font-medium flex-1">{employee.name}</div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-baker-700 hover:text-baker-800 hover:bg-baker-50"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}
