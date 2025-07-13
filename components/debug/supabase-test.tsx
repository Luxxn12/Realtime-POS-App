"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase } from "@/lib/supabase/client"

export function SupabaseTest() {
  const [testResult, setTestResult] = useState<string>("")
  const [loading, setLoading] = useState(false)

  const testConnection = async () => {
    setLoading(true)
    try {
      // Test client connection
      const { data: clientData, error: clientError } = await supabase.from("products").select("count").limit(1)

      if (clientError) {
        setTestResult(`Client Error: ${clientError.message}`)
        return
      }

      // Test API endpoint
      const response = await fetch("/api/products")
      const apiData = await response.json()

      setTestResult(`
        ✅ Client Connection: OK
        ✅ API Endpoint: OK
        📊 Products in DB: ${apiData.length || 0}
        🔗 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30)}...
      `)
    } catch (error) {
      setTestResult(`❌ Error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testConnection} disabled={loading} className="w-full">
          {loading ? "Testing..." : "Test Connection"}
        </Button>
        {testResult && <pre className="text-sm bg-gray-100 p-3 rounded whitespace-pre-wrap">{testResult}</pre>}
      </CardContent>
    </Card>
  )
}
