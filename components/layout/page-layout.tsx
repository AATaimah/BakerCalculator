import type React from "react"
import Link from "next/link"
import { Home } from "lucide-react"

interface PageLayoutProps {
  children: React.ReactNode
  title: string
  showHomeLink?: boolean
}

export function PageLayout({ children, title, showHomeLink = true }: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-baker-800 to-baker-900 text-white p-6 shadow-md flex items-center">
        {showHomeLink && (
          <Link href="/" className="text-white mr-4 hover:text-baker-100 transition-colors">
            <Home size={24} />
          </Link>
        )}
        <h1 className="text-2xl font-bold flex-1 text-center">{title}</h1>
      </header>

      <main className="flex-1 p-6 animate-fadeIn">{children}</main>

      <footer className="bg-gradient-to-r from-baker-800 to-baker-900 text-white p-4 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} Anas Taimah. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}
