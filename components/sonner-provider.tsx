"use client"

import { Toaster as SonnerToaster } from "sonner"

export function SonnerProvider() {
  return (
    <SonnerToaster 
      position="bottom-right" 
      toastOptions={{
        style: {
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: "0.375rem",
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        },
      }}
    />
  )
}