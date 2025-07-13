"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, ShoppingCart, Package, Users } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

export function RealTimeStats() {
  const [stats, setStats] = useState({
    todaySales: 0,
    todayOrders: 0,
    totalProducts: 0,
    totalUsers: 0, // Changed from totalCustomers
    lowStockProducts: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get today's sales
        const today = new Date().toISOString().split("T")[0]
        const { data: todayOrders } = await supabase
          .from("orders")
          .select("total_amount")
          .gte("created_at", `${today}T00:00:00`)
          .lte("created_at", `${today}T23:59:59`)

        const todaySales = todayOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0
        const todayOrdersCount = todayOrders?.length || 0

        // Get product stats
        const { data: products } = await supabase.from("products").select("stock")

        const totalProducts = products?.length || 0
        const lowStockProducts = products?.filter((p) => p.stock <= 10).length || 0

        // Get user count (from user_profiles table)
        const { count: totalUsers } = await supabase.from("user_profiles").select("*", { count: "exact", head: true }) // Changed from customers

        setStats({
          todaySales,
          todayOrders: todayOrdersCount,
          totalProducts,
          totalUsers: totalUsers || 0, // Changed from totalCustomers
          lowStockProducts,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()

    // Set up real-time subscriptions
    const ordersChannel = supabase
      .channel("orders-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, fetchStats)
      .subscribe()

    const productsChannel = supabase
      .channel("products-stats")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, fetchStats)
      .subscribe()

    const userProfilesChannel = supabase // Changed channel name
      .channel("user_profiles-stats") // Changed channel name
      .on("postgres_changes", { event: "*", schema: "public", table: "user_profiles" }, fetchStats) // Changed table name
      .subscribe()

    return () => {
      supabase.removeChannel(ordersChannel)
      supabase.removeChannel(productsChannel)
      supabase.removeChannel(userProfilesChannel) // Changed channel name
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Today's Sales</CardTitle>
          <TrendingUp className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">${stats.todaySales.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground mt-1">Real-time updates</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Orders</CardTitle>
          <ShoppingCart className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{stats.todayOrders}</div>
          <p className="text-xs text-muted-foreground mt-1">Today's orders</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Products</CardTitle>
          <Package className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{stats.totalProducts}</div>
          <p className="text-xs text-muted-foreground mt-1">{stats.lowStockProducts} low stock</p>
        </CardContent>
      </Card>

      <Card className="rounded-xl shadow-md hover:shadow-lg transition-shadow border border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Users</CardTitle>{" "}
          {/* Changed from Customers */}
          <Users className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground">{stats.totalUsers}</div>{" "}
          {/* Changed from totalCustomers */}
          <p className="text-xs text-muted-foreground mt-1">Total registered</p>
        </CardContent>
      </Card>
    </div>
  )
}
