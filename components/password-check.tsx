"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { usePassword } from "@/contexts/password-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock, Info } from "lucide-react"
import { toast } from "sonner"

export function PasswordCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authenticate, debugPassword } = usePassword()
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Debug on mount
  useEffect(() => {
    debugPassword()
  }, [debugPassword])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Log for debugging
    console.log("Submitting password:", password)

    const isValid = authenticate(password)

    if (!isValid) {
      toast.error("Invalid Password", {
        description: "The password you entered is incorrect. Please try again.",
      })
    }

    setIsSubmitting(false)
    setPassword("")
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-t-4 border-t-baker-600">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Lock className="h-5 w-5 text-baker-600" />
            Protected Area
          </CardTitle>
          <CardDescription>Please enter the password to access this area</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus-visible:ring-baker-500"
                  autoComplete="current-password"
                />
              </div>
              <div className="bg-amber-50 p-3 rounded-md border border-amber-100 text-amber-800 text-sm flex items-start gap-2">
                <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p>If you&apos;re having trouble logging in:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>If you&apos;re having trouble logging in:</li>
                    <li>Check that your environment variable is set correctly</li>
                    <li>Try clearing your browser cache</li>
                    <li>Check the browser console for debugging information</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-baker-700 hover:bg-baker-800"
              disabled={!password || isSubmitting}
            >
              {isSubmitting ? "Checking..." : "Submit"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
