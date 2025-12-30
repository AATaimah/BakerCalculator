"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  orderBy,
  writeBatch,
  limit,
} from "firebase/firestore"
import { db } from "@/firebase"

export interface Employee {
  id: string
  name: string
  createdAt: Date
  order: number
}

// Original employees from your code
const originalEmployees = [
  "Abu Omar",
  "Abu Talal",
  "Fadi",
  "Dawood",
  "Abu Yazan",
  "Khader",
  "Rami",
  "M. Al Naqlah",
  "Sultan",
  "Ayman",
  "Tarek",
  "Mohd F",
  "Ahmed",
  "Yazan",
  "Haidy",
  "Weeam",
  "Noor",
  "Sara Eid",
  "Jude",
]

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Update the initializeEmployees function to be more robust
  const initializeEmployees = async () => {
    try {
      const employeesQuery = query(collection(db, "employees"))
      const snapshot = await getDocs(employeesQuery)

      // If collection is empty, add original employees
      if (snapshot.empty && !initialized) {
        setInitialized(true)
        console.log("Initializing with original employees...")

        // Seed originals concurrently
        const seeds = originalEmployees.map((name, index) =>
          addDoc(collection(db, "employees"), {
            name,
            createdAt: new Date(),
            order: index,
          }),
        )

        await Promise.all(seeds)
        console.log("Successfully initialized with original employees")

        // Fetch again after initialization
        fetchEmployees()
      }
    } catch (err) {
      console.error("Error initializing employees:", err)
      setError("Failed to initialize employees: " + (err instanceof Error ? err.message : String(err)))
      setLoading(false)
    }
  }

  // Update the fetchEmployees function with better error handling
  const fetchEmployees = async () => {
    setLoading(true)
    try {
      console.log("Fetching employees from Firestore...")
      const employeesQuery = query(collection(db, "employees"), orderBy("order", "asc"))
      const snapshot = await getDocs(employeesQuery)

      let needsOrderMigration = false
      const employeesList = snapshot.docs.map((doc, idx) => {
        const data = doc.data()
        if (data.order === undefined) needsOrderMigration = true
        return {
          id: doc.id,
          ...data,
          order: data.order ?? idx,
          createdAt: data.createdAt?.toDate() || new Date(),
        }
      }) as Employee[]

      console.log(`Found ${employeesList.length} employees`)
      setEmployees(employeesList)
      setError(null)

      if (needsOrderMigration) {
        await reorderEmployees(
          employeesList.map((employee, index) => ({
            ...employee,
            order: index,
          })),
        )
      }

      // If no employees found and not initialized, initialize with original employees
      if (employeesList.length === 0 && !initialized) {
        console.log("No employees found, initializing...")
        await initializeEmployees()
      }
    } catch (err) {
      console.error("Error fetching employees:", err)
      setError("Failed to load employees: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  // Add employee
  const addEmployee = async (name: string) => {
    try {
      const nextOrderSnapshot = await getDocs(
        query(collection(db, "employees"), orderBy("order", "desc"), limit(1)),
      )
      const nextOrder = nextOrderSnapshot.empty ? 0 : (nextOrderSnapshot.docs[0].data().order ?? 0) + 1

      const docRef = await addDoc(collection(db, "employees"), {
        name,
        createdAt: new Date(),
        order: nextOrder,
      })
      
      // Refresh the employee list
      fetchEmployees()
      return docRef.id
    } catch (err) {
      console.error("Error adding employee:", err)
      throw new Error("Failed to add employee")
    }
  }

  const reorderEmployees = async (ordered: Employee[]) => {
    const batch = writeBatch(db)
    ordered.forEach((employee, index) => {
      batch.update(doc(db, "employees", employee.id), { order: index })
    })
    await batch.commit()
    setEmployees(ordered)
  }

  // Remove employee
  const removeEmployee = async (id: string) => {
    try {
      await deleteDoc(doc(db, "employees", id))
      
      // Refresh the employee list
      fetchEmployees()
    } catch (err) {
      console.error("Error removing employee:", err)
      throw new Error("Failed to remove employee")
    }
  }

  // Load employees on mount
  useEffect(() => {
    fetchEmployees()
  }, [])

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    addEmployee,
    removeEmployee,
    reorderEmployees,
  }
}
