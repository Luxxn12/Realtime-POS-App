"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export default function AuthCallbackPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // This page is primarily for handling email confirmation links from Supabase.
        // With the new OTP signup, this page might not be directly used for initial signup verification,
        // but it's good to keep for other Supabase email flows (e.g., password reset, email change).
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error("Auth callback error:", error)
          setStatus("error")
          setMessage(error.message || "Authentication failed")
          return
        }

        if (data.session) {
          setStatus("success")
          setMessage("Authentication successful! Redirecting to dashboard...")

          // Redirect after 2 seconds
          setTimeout(() => {
            router.push("/")
          }, 2000)
        } else {
          setStatus("error")
          setMessage("No valid session found. Please try logging in again.")
        }
      } catch (error: any) {
        console.error("Auth callback error:", error)
        setStatus("error")
        setMessage("An unexpected error occurred during authentication.")
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Authentication Status</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-blue-600 mx-auto animate-spin" />
              <p className="text-gray-600">Processing authentication...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Success!</h3>
                <p className="text-sm text-gray-600 mt-2">{message}</p>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-600 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Authentication Failed</h3>
                <p className="text-sm text-gray-600 mt-2">{message}</p>
              </div>
              <Button onClick={() => router.push("/login")} className="w-full">
                Back to Login
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
