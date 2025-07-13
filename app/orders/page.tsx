"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, Receipt, Calendar, DollarSign } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getOrders } from "@/lib/api/orders"
import { OrderDetailDialog } from "@/components/orders/order-detail-dialog"
import { useRealtimeOrders } from "@/lib/hooks/use-realtime"
import { format } from "date-fns"

/* -------------------------------------------------
   helpers
--------------------------------------------------*/
const getPaymentMethodColor = (method: string) => {
  switch (method.toLowerCase()) {
    case "cash":
      return "bg-green-100 text-green-800"
    case "card":
      return "bg-primary/10 text-primary"
    case "digital":
      return "bg-purple-100 text-purple-800"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "completed":
      return "default"
    case "pending":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}

export default function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetailOpen, setOrderDetailOpen] = useState(false)

  // Enable real-time updates
  useRealtimeOrders()

  const {
    data: orders = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
    refetchInterval: 30000, // Refetch every 30 seconds
  })

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customers?.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.user_profiles?.full_name || "").toLowerCase().includes(searchTerm.toLowerCase()), // Filter by admin name
  )

  const handleViewOrder = (order) => {
    setSelectedOrder(order)
    setOrderDetailOpen(true)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load orders</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Calculate summary stats
  const totalSales = orders.reduce((sum, order) => sum + order.total_amount, 0)
  const todayOrders = orders.filter((order) => {
    const orderDate = new Date(order.created_at).toDateString()
    const today = new Date().toDateString()
    return orderDate === today
  })
  const todaySales = todayOrders.reduce((sum, order) => sum + order.total_amount, 0)

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card className="rounded-xl shadow-md border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
              <Receipt className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{orders.length}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Today's Orders</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{todayOrders.length}</div>
              <p className="text-xs text-muted-foreground">${todaySales.toFixed(2)} sales</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-md border border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">${totalSales.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="rounded-xl shadow-md border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <Receipt className="h-6 w-6 text-primary" />
                Order History
              </CardTitle>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  {/* header cells rendered as an array to avoid whitespace text-nodes */}
                  <TableRow className="bg-muted/50">
                    {[
                      <TableHead key="id" className="text-foreground">
                        Order&nbsp;ID
                      </TableHead>,
                      <TableHead key="cust" className="text-foreground">
                        Customer
                      </TableHead>,
                      <TableHead key="dt" className="text-foreground">
                        Date&nbsp;&amp;&nbsp;Time
                      </TableHead>,
                      <TableHead key="items" className="text-foreground">
                        Items
                      </TableHead>,
                      <TableHead key="pay" className="text-foreground">
                        Payment&nbsp;Method
                      </TableHead>,
                      <TableHead key="total" className="text-foreground">
                        Total
                      </TableHead>,
                      <TableHead key="admin" className="text-foreground">
                        Processed&nbsp;By
                      </TableHead>,
                      <TableHead key="stat" className="text-foreground">
                        Status
                      </TableHead>,
                      <TableHead key="act" className="text-foreground">
                        Actions
                      </TableHead>,
                    ]}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-muted/20 transition-colors">
                      {[
                        <TableCell key="id">
                          <span className="font-mono text-sm text-foreground">#{order.id.slice(-8).toUpperCase()}</span>
                        </TableCell>,

                        <TableCell key="cust">
                          {order.customers ? (
                            <>
                              <p className="font-medium text-foreground">{order.customers.name}</p>
                              <p className="text-sm text-muted-foreground">{order.customers.email}</p>
                            </>
                          ) : (
                            <p className="text-muted-foreground">Walk-in</p>
                          )}
                        </TableCell>,

                        <TableCell key="dt">
                          <p className="font-medium text-foreground">
                            {format(new Date(order.created_at), "MMM dd, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(order.created_at), "hh:mm a")}
                          </p>
                        </TableCell>,

                        <TableCell key="items" className="text-foreground">
                          {order.order_items?.length ?? 0}&nbsp;item
                          {(order.order_items?.length ?? 0) !== 1 && "s"}
                        </TableCell>,

                        <TableCell key="pay">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentMethodColor(
                              order.payment_method,
                            )}`}
                          >
                            {order.payment_method.charAt(0).toUpperCase() + order.payment_method.slice(1)}
                          </span>
                        </TableCell>,

                        <TableCell key="total">
                          <p className="font-semibold text-foreground">${order.total_amount.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">Tax: ${order.tax_amount.toFixed(2)}</p>
                        </TableCell>,

                        <TableCell key="admin" className="text-foreground">
                          {order.user_profiles?.full_name ?? "N/A"}
                        </TableCell>,

                        <TableCell key="stat">
                          <Badge variant={getStatusColor(order.payment_status)} className="capitalize">
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </Badge>
                        </TableCell>,

                        <TableCell key="act">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewOrder(order)}
                            className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </TableCell>,
                      ]}
                    </TableRow>
                  ))}

                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No orders found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <OrderDetailDialog open={orderDetailOpen} onOpenChange={setOrderDetailOpen} order={selectedOrder} />
    </div>
  )
}
