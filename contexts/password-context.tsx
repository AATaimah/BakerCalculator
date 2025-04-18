"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type PasswordContextType = {
  isAuthenticated: boolean
  authenticate: (password: string) => boolean
}

// Get the password from environment variable
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ""

// Create the context with a default value to avoid undefined
const PasswordContext = createContext<PasswordContextType>({
  isAuthenticated: false,
  authenticate: () => false,
})

export function PasswordProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("baker_auth")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const authenticate = (password: string) => {
    // Check if the entered password matches the admin password
    const isValid = password === ADMIN_PASSWORD

    if (isValid) {
      setIsAuthenticated(true)
      localStorage.setItem("baker_auth", "true")
    }

    return isValid
  }

  return <PasswordContext.Provider value={{ isAuthenticated, authenticate }}>{children}</PasswordContext.Provider>
}

export function usePassword() {
  const context = useContext(PasswordContext)
  return context
}
