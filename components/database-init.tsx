"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2, Database } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function DatabaseInit() {
  const [initializing, setInitializing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const initializeDatabase = async () => {
    setInitializing(true)
    setError(null)

    try {
      const response = await fetch("/api/init", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setInitialized(true)
        toast({
          title: "Success!",
          description: "Database tables initialized successfully",
        })
      } else {
        throw new Error(data.message || "Failed to initialize database")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setInitializing(false)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-5 h-5" />
          <span>Database Setup</span>
        </CardTitle>
        <CardDescription>Initialize the database tables for webhook storage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {initialized && (
            <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-md">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-800 text-sm">Database tables initialized successfully!</span>
            </div>
          )}

          <Button onClick={initializeDatabase} disabled={initializing || initialized} className="w-full">
            {initializing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Initializing Database...
              </>
            ) : initialized ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Database Initialized
              </>
            ) : (
              <>
                <Database className="w-4 h-4 mr-2" />
                Initialize Database Tables
              </>
            )}
          </Button>

          <p className="text-sm text-muted-foreground">
            Click this button to create the necessary database tables for storing webhook events.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
