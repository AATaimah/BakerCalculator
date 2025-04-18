"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type PasswordContextType = {
  isAuthenticated: boolean
  authenticate: (password: string) => boolean
  debugPassword: () => void // Added for debugging
}

// Get the password from environment variable
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || ""

// Create the context with a default value to avoid undefined
const PasswordContext = createContext<PasswordContextType>({
  isAuthenticated: false,
  authenticate: () => false,
  debugPassword: () => {}, // Added for debugging
})

export function PasswordProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is already authenticated on mount
  useEffect(() => {
    const authStatus = localStorage.getItem("baker_auth")
    if (authStatus === "true") {
      setIsAuthenticated(true)
    }

    // Log the environment variable on mount for debugging
    console.log("Environment password length:", ADMIN_PASSWORD.length)
    console.log(
      "Environment password first/last char:",
      ADMIN_PASSWORD.length > 0 ? `${ADMIN_PASSWORD[0]}...${ADMIN_PASSWORD[ADMIN_PASSWORD.length - 1]}` : "empty",
    )
  }, [])

  const authenticate = (password: string) => {
    // Log for debugging
    console.log("Entered password:", password)
    console.log("Entered password length:", password.length)
    console.log("Environment password:", ADMIN_PASSWORD)
    console.log("Password match:", password === ADMIN_PASSWORD)

    // Check if the entered password matches the admin password
    const isValid = password === ADMIN_PASSWORD && ADMIN_PASSWORD !== ""

    if (isValid) {
      setIsAuthenticated(true)
      localStorage.setItem("baker_auth", "true")
    }

    return isValid
  }

  // Debug function to check password in console
  const debugPassword = () => {
    console.log("Current admin password:", ADMIN_PASSWORD)
    console.log("Password length:", ADMIN_PASSWORD.length)
    console.log("Is password empty:", ADMIN_PASSWORD === "")
  }

  return (
    <PasswordContext.Provider value={{ isAuthenticated, authenticate, debugPassword }}>
      {children}
    </PasswordContext.Provider>
  )
}

export function usePassword() {
  const context = useContext(PasswordContext)
  return context
}
