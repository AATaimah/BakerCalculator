"use client"

import type React from "react"

import { useState } from "react"
import { usePassword } from "@/contexts/password-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Lock } from "lucide-react"
import { toast } from "sonner"

export function PasswordCheck({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, authenticate } = usePassword()
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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
