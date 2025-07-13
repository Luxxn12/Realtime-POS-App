"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Search, Plus, Minus, ShoppingCart, CreditCard } from "lucide-react"
import { usePOSStore } from "@/lib/store/pos-store"
import { useQuery } from "@tanstack/react-query"
import { getProducts } from "@/lib/api/products"
import { PaymentDialog } from "@/components/pos/payment-dialog"
import { Package } from "lucide-react" // Import Package component
import { useRealtimeProducts } from "@/lib/hooks/use-realtime"
import Image from "next/image" // Import Next.js Image component

export default function POSPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [paymentOpen, setPaymentOpen] = useState(false)
  const { cart, addToCart, removeFromCart, updateQuantity, clearCart, getTotal } = usePOSStore()

  // Enable real-time updates
  useRealtimeProducts()

  const {
    data: products = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    refetchInterval: 30000, // Refetch every 30 seconds as backup
  })

  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.barcode?.includes(searchTerm),
  )

  const handlePayment = () => {
    setPaymentOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load products</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2">
            <Card className="rounded-xl shadow-md border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-foreground">Products</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products or scan barcode..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-10 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {filteredProducts.map((product) => (
                    <Card
                      key={product.id}
                      className="cursor-pointer hover:shadow-lg transition-shadow rounded-lg border border-border"
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center relative overflow-hidden border border-border">
                          {product.image_url ? (
                            <Image
                              src={product.image_url || "/placeholder.svg"}
                              alt={product.name}
                              layout="fill"
                              objectFit="cover"
                              className="rounded-lg"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-muted-foreground" />
                          )}
                        </div>
                        <h3 className="font-semibold text-base text-foreground mb-1">{product.name}</h3>
                        <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-lg text-foreground">${product.price.toFixed(2)}</span>
                          <Badge variant={product.stock > 10 ? "default" : "destructive"} className="capitalize">
                            {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                        <Button
                          onClick={() => addToCart(product)}
                          className="w-full mt-3 h-10 text-base font-semibold rounded-md shadow-sm hover:shadow-md transition-all"
                          disabled={product.stock === 0}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to Cart
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                  {filteredProducts.length === 0 && (
                    <p className="col-span-full text-center text-muted-foreground py-8">No products found.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 rounded-xl shadow-md border border-border">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  Cart ({cart.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                  {cart.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">Cart is empty</p>
                  ) : (
                    cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground text-sm">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center font-medium text-foreground">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="ml-4">
                          <p className="font-semibold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {cart.length > 0 && (
                  <>
                    <Separator className="my-6 bg-border" />
                    <div className="space-y-3">
                      <div className="flex justify-between text-foreground">
                        <span className="text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">${getTotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-foreground">
                        <span className="text-muted-foreground">Tax (10%):</span>
                        <span className="font-medium">${(getTotal() * 0.1).toFixed(2)}</span>
                      </div>
                      <Separator className="bg-border" />
                      <div className="flex justify-between font-bold text-xl text-foreground">
                        <span>Total:</span>
                        <span>${(getTotal() * 1.1).toFixed(2)}</span>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <Button
                        variant="outline"
                        onClick={clearCart}
                        className="flex-1 h-11 text-base font-semibold rounded-md bg-transparent"
                      >
                        Clear
                      </Button>
                      <Button
                        onClick={handlePayment}
                        className="flex-1 h-11 text-base font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <PaymentDialog
        open={paymentOpen}
        onOpenChange={setPaymentOpen}
        total={getTotal() * 1.1}
        cart={cart}
        onSuccess={() => {
          clearCart()
          setPaymentOpen(false)
        }}
      />
    </div>
  )
}
