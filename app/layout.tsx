import type React from "react"
import "@/app/globals.css"
import { Inter } from 'next/font/google'
import { SonnerProvider } from "@/components/sonner-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "The Baker - Tip Calculator",
  description: "Calculate and distribute tips among employees",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <SonnerProvider />
      </body>
    </html>
  )
}