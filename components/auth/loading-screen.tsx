"use client"

import { Loader2, ShoppingCart } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <ShoppingCart className="h-12 w-12 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">POS System</h1>
        </div>
        <Loader2 className="h-8 w-8 text-blue-600 mx-auto animate-spin mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
