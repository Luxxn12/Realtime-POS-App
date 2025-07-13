"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, Users, Receipt } from "lucide-react"
import Link from "next/link"
import { RealTimeStats } from "@/components/dashboard/real-time-stats"
import { useAuth } from "@/components/auth/auth-provider"
import { LoadingScreen } from "@/components/auth/loading-screen"

export default function HomePage() {
  const { user, userProfile, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  if (!user) {
    return null // Will be redirected to login by AuthProvider
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-foreground mb-3">POS Dashboard</h1>
          <p className="text-lg text-muted-foreground">
            Welcome back, <span className="font-semibold text-primary">{userProfile?.full_name || user.email}</span>!
          </p>
          <p className="text-sm text-muted-foreground mt-1">Real-time Point of Sale Management System</p>
        </div>

        <div className="mb-10">
          <RealTimeStats />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/pos" className="block">
            <Card className="h-full flex flex-col justify-between p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border border-border">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Point of Sale
                </CardTitle>
              </CardHeader>
              <CardDescription className="text-muted-foreground">
                Process sales and manage transactions efficiently.
              </CardDescription>
            </Card>
          </Link>

          <Link href="/inventory" className="block">
            <Card className="h-full flex flex-col justify-between p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border border-border">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                  <Package className="h-6 w-6 text-primary" />
                  Inventory
                </CardTitle>
              </CardHeader>
              <CardDescription className="text-muted-foreground">
                Manage products, stock levels, and product details.
              </CardDescription>
            </Card>
          </Link>

          <Link href="/users" className="block">
            <Card className="h-full flex flex-col justify-between p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border border-border">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                  <Users className="h-6 w-6 text-primary" />
                  Users
                </CardTitle>
              </CardHeader>
              <CardDescription className="text-muted-foreground">
                Manage user accounts, roles, and profiles.
              </CardDescription>
            </Card>
          </Link>

          <Link href="/orders" className="block">
            <Card className="h-full flex flex-col justify-between p-6 rounded-xl shadow-md hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer border border-border">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
                  <Receipt className="h-6 w-6 text-primary" />
                  Order History
                </CardTitle>
              </CardHeader>
              <CardDescription className="text-muted-foreground">
                View all transactions, receipts, and order details.
              </CardDescription>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
