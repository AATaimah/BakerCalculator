"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, DollarSign, Clock, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEmployees } from "@/hooks/use-employees"
import { useHistory } from "@/hooks/use-history"
import { toast } from "sonner"
import { PageLayout } from "@/components/layout/page-layout"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function CalculateTips() {
  const router = useRouter()
  const { employees, loading, error } = useEmployees()
  const { saveTipCalculation } = useHistory()
  const [isMounted, setIsMounted] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [previewRows, setPreviewRows] = useState<{ id: string; name: string; hours: number; tip: number }[]>([])

  const [denominations, setDenominations] = useState({
    fives: "",
    tens: "",
    twenties: "",
    fifties: "",
    hunnids: "",
    registeredTips: "",
  })
  const [totals, setTotals] = useState({
    totalTips: 0,
    salesTax: 0,
    netTips: 0,
  })
  const [employeeHours, setEmployeeHours] = useState<Record<string, string>>({})
  const [employeeTips, setEmployeeTips] = useState<{ employee: string; employeeId: string; deservedTip: number }[]>([])
  const [remainder, setRemainder] = useState(0)
  // Handle client-side rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Handle input change for denominations
  const handleDenominationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setDenominations((prev) => ({ ...prev, [id]: value }))
  }

  // Handle input change for employee hours
  const handleHoursChange = (employeeId: string, value: string) => {
    setEmployeeHours((prev) => ({ ...prev, [employeeId]: value }))
  }

  // Calculate employee tips with improved logic to ensure non-negative remainder
  const calculateEmployeeTips = useCallback(
    (netTips: number) => {
      if (employees.length === 0) return

      // Step 1: Calculate hours worked for each employee
      const hoursWorked = employees.map((employee) => ({
        employee: employee.name,
        employeeId: employee.id,
        hours: Number.parseFloat(employeeHours[employee.id] || "0") || 0,
      }))

      // Step 2: Calculate hours divided by 40 for each employee
      const hoursDividedBy40 = hoursWorked.map((employee) => ({
        employee: employee.employee,
        employeeId: employee.employeeId,
        hoursDividedBy40: employee.hours / 40,
      }))

      // Step 3: Calculate total hours divided by 40
      const totalHoursDividedBy40 = hoursDividedBy40.reduce((total, current) => total + current.hoursDividedBy40, 0)

      // If no hours worked, set all tips to 0
      if (totalHoursDividedBy40 <= 0) {
        const zeroTips = employees.map((emp) => ({
          employee: emp.name,
          employeeId: emp.id,
          deservedTip: 0,
        }))
        setEmployeeTips(zeroTips)
        setRemainder(netTips)
        return
      }

      // Step 4: Calculate the initial ratio (rounded to nearest $5)
      const initialRatio = Math.floor(netTips / totalHoursDividedBy40 / 5) * 5

      // Step 5: Calculate initial deserved tips
      const initialDeservedTips = hoursWorked.map((employee) => ({
        employee: employee.employee,
        employeeId: employee.employeeId,
        deservedTip: Math.floor((initialRatio * employee.hours) / 40 / 5) * 5,
      }))

      // Step 6: Calculate the sum of initial deserved tips
      const totalInitialTips = initialDeservedTips.reduce((acc, current) => acc + current.deservedTip, 0)

      // Step 7: Calculate the initial remainder
      const initialRemainder = netTips - totalInitialTips

      // Step 8: If remainder is negative, adjust the tips
      if (initialRemainder < 0) {
        // Recalculate with a lower ratio to ensure positive remainder
        const adjustedRatio = Math.floor((netTips * 0.95) / totalHoursDividedBy40 / 5) * 5

        const adjustedDeservedTips = hoursWorked.map((employee) => ({
          employee: employee.employee,
          employeeId: employee.employeeId,
          deservedTip: Math.floor((adjustedRatio * employee.hours) / 40 / 5) * 5,
        }))

        const totalAdjustedTips = adjustedDeservedTips.reduce((acc, current) => acc + current.deservedTip, 0)
        const adjustedRemainder = netTips - totalAdjustedTips

        setEmployeeTips(adjustedDeservedTips)
        setRemainder(adjustedRemainder)
      } else {
        // If remainder is already positive, use the initial calculation
        setEmployeeTips(initialDeservedTips)
        setRemainder(initialRemainder)
      }
    },
    [employeeHours, employees],
  )

  // Calculate total tips
  useEffect(() => {
    if (!isMounted) return

    const fives = Number.parseFloat(denominations.fives) || 0
    const tens = Number.parseFloat(denominations.tens) || 0
    const twenties = Number.parseFloat(denominations.twenties) || 0
    const fifties = Number.parseFloat(denominations.fifties) || 0
    const hunnids = Number.parseFloat(denominations.hunnids) || 0
    const registeredTips = Number.parseFloat(denominations.registeredTips) || 0

    const total = fives * 5 + tens * 10 + twenties * 20 + fifties * 50 + hunnids * 100
    const salesTax = Math.round((registeredTips * 0.25) / 5) * 5
    const netTips = total - salesTax

    setTotals({
      totalTips: total,
      salesTax: salesTax,
      netTips: netTips,
    })

    if (employees.length > 0) {
      calculateEmployeeTips(netTips)
    }
  }, [denominations, employeeHours, employees, isMounted, calculateEmployeeTips])

  const openConfirm = () => {
    const rows = employees.map((employee) => {
      const hours = Number.parseFloat(employeeHours[employee.id] || "0") || 0
      const tip = employeeTips.find((dt) => dt.employeeId === employee.id)?.deservedTip || 0
      return { id: employee.id, name: employee.name, hours, tip }
    })

    const invalid = rows.find((row) => !Number.isFinite(row.hours) || row.hours < 0)
    if (invalid) {
      toast.error("Invalid hours", {
        description: `${invalid.name} has an invalid hour entry. Hours must be 0–149.`,
      })
      return
    }

    setPreviewRows(rows)
    setConfirmOpen(true)
  }

  // Save and redirect after confirmation
  const saveAndRedirect = async () => {
    setIsSaving(true)

    try {
      const employeeData: Record<string, { hours: number; deservedTip: number }> = {}

      previewRows.forEach((row) => {
        employeeData[row.name] = { hours: row.hours, deservedTip: row.tip }
      })

      const tipData = {
        totalTips: totals.totalTips,
        salesTax: totals.salesTax,
        netTips: totals.netTips,
        remainder: remainder,
        employeeData: employeeData,
        // date will be added by the hook
      }

      await saveTipCalculation(tipData)

      toast.success("Success", {
        description: "Tip calculation saved successfully!",
      })

      router.push("/history")
    } catch (error) {
      toast.error("Error", {
        description: "Failed to save tip calculation. Please try again.",
      })
      console.error("Error saving tip calculation:", error)
    } finally {
      setIsSaving(false)
      setConfirmOpen(false)
    }
  }

  // Don't render anything on the server
  if (!isMounted) {
    return null
  }

  if (loading) {
    return (
      <PageLayout title="Calculate Tips">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-baker-800" />
            <p>Loading employees...</p>
          </div>
        </div>
      </PageLayout>
    )
  }

  if (error) {
    return (
      <PageLayout title="Calculate Tips">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-card">
            <CardContent className="pt-6">
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={() => router.push("/")} className="w-full bg-baker-700 hover:bg-baker-800">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  if (employees.length === 0) {
    return (
      <PageLayout title="Calculate Tips">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md shadow-card">
            <CardContent className="pt-6">
              <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No employees found</h3>
                <p className="text-gray-500">Please add employees before calculating tips.</p>
              </div>
              <Button onClick={() => router.push("/employees")} className="w-full bg-baker-700 hover:bg-baker-800">
                Add Employees
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout title="Calculate Tips">
      <div className="max-w-7xl mx-auto grid gap-6 md:grid-cols-2">
        {/* Denominations Card */}
        <Card className="shadow-card border-t-4 border-t-baker-600 animate-fadeIn">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-baker-600" />
              Tip Calculation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="fives" className="text-sm font-medium">
                  Total number of 5s:
                </Label>
                <Input
                  id="fives"
                  type="text"
                  inputMode="numeric"
                  value={denominations.fives}
                  onChange={handleDenominationChange}
                  className="focus-visible:ring-baker-500"
                />
              </div>

              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="tens" className="text-sm font-medium">
                  Total number of 10s:
                </Label>
                <Input
                  id="tens"
                  type="text"
                  inputMode="numeric"
                  value={denominations.tens}
                  onChange={handleDenominationChange}
                  className="focus-visible:ring-baker-500"
                />
              </div>

              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="twenties" className="text-sm font-medium">
                  Total number of 20s:
                </Label>
                <Input
                  id="twenties"
                  type="text"
                  inputMode="numeric"
                  value={denominations.twenties}
                  onChange={handleDenominationChange}
                  className="focus-visible:ring-baker-500"
                />
              </div>

              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="fifties" className="text-sm font-medium">
                  Total number of 50s:
                </Label>
                <Input
                  id="fifties"
                  type="text"
                  inputMode="numeric"
                  value={denominations.fifties}
                  onChange={handleDenominationChange}
                  className="focus-visible:ring-baker-500"
                />
              </div>

              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="hunnids" className="text-sm font-medium">
                  Total number of 100s:
                </Label>
                <Input
                  id="hunnids"
                  type="text"
                  inputMode="numeric"
                  value={denominations.hunnids}
                  onChange={handleDenominationChange}
                  className="focus-visible:ring-baker-500"
                />
              </div>

              <div className="grid grid-cols-2 items-center gap-4">
                <Label htmlFor="registeredTips" className="text-sm font-medium">
                  Registered tips:
                </Label>
                <Input
                  id="registeredTips"
                  type="text"
                  inputMode="numeric"
                  value={denominations.registeredTips}
                  onChange={handleDenominationChange}
                  className="focus-visible:ring-baker-500"
                />
              </div>
            </div>

            <div className="mt-6 space-y-2 p-4 bg-baker-50 rounded-md border border-baker-100">
              <div className="flex justify-between">
                <span className="font-medium">Total Tips:</span>
                <span className="font-bold">${totals.totalTips.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sales tax to set aside:</span>
                <span className="font-bold">${totals.salesTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Tips to be distributed:</span>
                <span className="font-bold">${totals.netTips.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employee Hours Card */}
        <Card className="shadow-card border-t-4 border-t-baker-600 animate-fadeIn">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Clock className="h-5 w-5 text-baker-600" />
              Employee Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {employees.map((employee) => (
                <div key={employee.id} className="flex items-center gap-2">
                  <Label htmlFor={`hours_${employee.id}`} className="flex-1 truncate text-sm font-medium">
                    {employee.name}:
                  </Label>
                  <Input
                    id={`hours_${employee.id}`}
                    type="text"
                    inputMode="numeric"
                    className="w-20 focus-visible:ring-baker-500"
                    value={employeeHours[employee.id] || ""}
                    onChange={(e) => handleHoursChange(employee.id, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Employee Tips Card */}
        <Card className="md:col-span-2 shadow-card border-t-4 border-t-baker-600 animate-fadeIn">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-baker-600" />
              Employee Tips Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-baker-50 border-b">
                    <th className="text-left p-3 text-baker-800 font-medium">Employee</th>
                    <th className="text-right p-3 text-baker-800 font-medium">Deserved Tip</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {employeeTips.map((employeeTip, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 font-medium">{employeeTip.employee}</td>
                      <td className="text-right p-3 font-mono">${employeeTip.deservedTip.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right font-bold text-baker-800 bg-baker-50 p-3 rounded-md border border-baker-100">
              Remainder: <span className="font-mono">${remainder.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-16 right-6">
        <Button
          onClick={openConfirm}
          disabled={isSaving}
          className="rounded-full bg-baker-700 hover:bg-baker-800 shadow-md flex items-center gap-2 px-6"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm tip distribution</AlertDialogTitle>
            <AlertDialogDescription>
              Review hours and payouts before saving.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="max-h-72 overflow-y-auto rounded-md border">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-baker-50 border-b">
                <tr>
                  <th className="text-left p-2 font-medium text-baker-800">Employee</th>
                  <th className="text-right p-2 font-medium text-baker-800">Hours</th>
                  <th className="text-right p-2 font-medium text-baker-800">Tip</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {previewRows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-2">{row.name}</td>
                    <td className="p-2 text-right font-mono">{row.hours.toFixed(2)}</td>
                    <td className="p-2 text-right font-mono">${row.tip.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Go back</AlertDialogCancel>
            <AlertDialogAction
              onClick={saveAndRedirect}
              disabled={isSaving}
              className="bg-baker-700 hover:bg-baker-800"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  )
}
