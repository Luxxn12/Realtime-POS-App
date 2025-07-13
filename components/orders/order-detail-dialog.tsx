"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Receipt, User, Calendar, CreditCard, Package, UserCheck } from "lucide-react"
import { format } from "date-fns"

interface OrderDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: any
}

export function OrderDetailDialog({ open, onOpenChange, order }: OrderDetailDialogProps) {
  if (!order) return null

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "cash":
        return "💵"
      case "card":
        return "💳"
      case "digital":
        return "📱"
      default:
        return "💰"
    }
  }

  const subtotal = order.total_amount - order.tax_amount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl shadow-lg border border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Receipt className="h-6 w-6 text-primary" />
            Order Details - <span className="font-mono text-primary">#{order.id.slice(-8).toUpperCase()}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Order Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Order Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(order.created_at), "MMMM dd, yyyy 'at' hh:mm a")}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Payment Method</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getPaymentMethodIcon(order.payment_method)}</span>
                    <span className="text-sm text-muted-foreground capitalize">{order.payment_method}</span>
                  </div>
                </div>
              </div>

              {/* Admin who created the order */}
              <div className="flex items-center gap-3">
                <UserCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Processed By</p>
                  <p className="text-sm text-muted-foreground">{order.user_profiles?.full_name || "System Admin"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Customer</p>
                  {order.customers ? (
                    <div>
                      <p className="text-sm text-foreground">{order.customers.name}</p>
                      <p className="text-xs text-muted-foreground">{order.customers.email}</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Walk-in Customer</p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-foreground">Status</p>
                <Badge
                  variant={order.payment_status === "completed" ? "default" : "secondary"}
                  className="capitalize mt-1"
                >
                  {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>

          <Separator className="bg-border" />

          {/* Order Items */}
          <div>
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
              <Package className="h-5 w-5 text-primary" />
              Order Items
            </h3>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-foreground">Product</TableHead>
                  <TableHead className="text-foreground">Quantity</TableHead>
                  <TableHead className="text-foreground">Unit Price</TableHead>
                  <TableHead className="text-foreground">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items?.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{item.products?.name || "Unknown Product"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">{item.quantity}</TableCell>
                    <TableCell className="text-foreground">${item.unit_price.toFixed(2)}</TableCell>
                    <TableCell className="font-medium text-foreground">${item.total_price.toFixed(2)}</TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                      No items found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <Separator className="bg-border" />

          {/* Order Summary */}
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-foreground">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span className="text-muted-foreground">Tax (10%):</span>
                <span className="font-medium">${order.tax_amount.toFixed(2)}</span>
              </div>
              <Separator className="bg-border my-2" />
              <div className="flex justify-between font-bold text-xl text-foreground">
                <span>Total:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
