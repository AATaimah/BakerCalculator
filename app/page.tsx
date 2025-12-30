import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CalculatorIcon, UsersIcon, HistoryIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-gradient-to-r from-baker-800 to-baker-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">The Baker</h1>
          <p className="text-lg text-baker-100 max-w-2xl mx-auto animate-slideUp">
            Efficiently calculate and distribute tips among your team members
          </p>
        </div>
      </header>

      <main className="flex-1 py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="shadow-card hover:shadow-lg transition-shadow duration-300 border-t-4 border-t-baker-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <CalculatorIcon className="h-5 w-5 text-baker-600" />
                  Calculate Tips
                </CardTitle>
                <CardDescription>Distribute tips fairly among employees</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Enter cash denominations and employee hours to calculate fair tip distribution.
                </p>
                <Link href="/calculate" className="w-full">
                  <Button className="w-full bg-baker-700 hover:bg-baker-800">Calculate Tips</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-shadow duration-300 border-t-4 border-t-baker-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <UsersIcon className="h-5 w-5 text-baker-600" />
                  Manage Employees
                </CardTitle>
                <CardDescription>Add or remove team members</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Keep your employee roster up to date by adding new staff or removing former employees.
                </p>
                <Link href="/employees" className="w-full">
                  <Button className="w-full bg-baker-700 hover:bg-baker-800">Manage Employees</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-lg transition-shadow duration-300 border-t-4 border-t-baker-600">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center gap-2">
                  <HistoryIcon className="h-5 w-5 text-baker-600" />
                  Tip History
                </CardTitle>
                <CardDescription>View past tip calculations</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  Access historical tip distribution data and review previous calculations.
                </p>
                <Link href="/history" className="w-full">
                  <Button className="w-full bg-baker-700 hover:bg-baker-800">View History</Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 bg-white rounded-lg shadow-card p-6 border border-gray-100">
            <h2 className="text-2xl font-bold mb-4 text-baker-800">About The Baker Tip Calculator</h2>
            <p className="text-gray-600 mb-4">
              The Baker Tip Calculator is designed to help restaurant managers fairly distribute tips among staff based
              on hours worked. Our system ensures accurate calculations and maintains records for transparency.
            </p>
            <div className="grid gap-4 md:grid-cols-3 mt-6">
              <div className="bg-baker-50 p-4 rounded-lg border border-baker-100">
                <h3 className="font-medium text-baker-800 mb-2">Fair Distribution</h3>
                <p className="text-sm text-gray-600">Automatically calculates tips based on hours worked</p>
              </div>
              <div className="bg-baker-50 p-4 rounded-lg border border-baker-100">
                <h3 className="font-medium text-baker-800 mb-2">Easy Management</h3>
                <p className="text-sm text-gray-600">Simple interface to manage your employee roster</p>
              </div>
              <div className="bg-baker-50 p-4 rounded-lg border border-baker-100">
                <h3 className="font-medium text-baker-800 mb-2">Cloud Storage</h3>
                <p className="text-sm text-gray-600">Data securely stored for easy access</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-gradient-to-r from-baker-800 to-baker-900 text-white p-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mb-2">&copy; {new Date().getFullYear()} Anas Taimah. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  )
}
