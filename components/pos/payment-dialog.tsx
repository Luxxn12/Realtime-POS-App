"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, Banknote, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createOrder } from "@/lib/api/orders"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface PaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  total: number
  cart: any[]
  onSuccess: () => void
}

export function PaymentDialog({ open, onOpenChange, total, cart, onSuccess }: PaymentDialogProps) {
  const [cashReceived, setCashReceived] = useState("")
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const queryClient = useQueryClient()

  const createOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  const handleCashPayment = async () => {
    const received = Number.parseFloat(cashReceived)
    if (received < total) {
      toast({
        title: "Insufficient Amount",
        description: "Cash received is less than total amount",
        variant: "destructive",
      })
      return
    }

    setProcessing(true)
    try {
      await createOrderMutation.mutateAsync({
        cart,
        total,
        paymentMethod: "cash",
      })

      toast({
        title: "Payment Successful",
        description: `Change: $${(received - total).toFixed(2)}`,
      })

      setCashReceived("")
      onSuccess()
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleCardPayment = async () => {
    setProcessing(true)
    try {
      await createOrderMutation.mutateAsync({
        cart,
        total,
        paymentMethod: "card",
      })

      toast({
        title: "Payment Successful",
        description: "Card payment processed successfully",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  const handleDigitalPayment = async () => {
    setProcessing(true)
    try {
      await createOrderMutation.mutateAsync({
        cart,
        total,
        paymentMethod: "digital",
      })

      toast({
        title: "Payment Successful",
        description: "Digital payment processed successfully",
      })

      onSuccess()
    } catch (error) {
      toast({
        title: "Payment Failed",
        description: "Failed to process payment",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl shadow-lg border border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Payment</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="bg-muted/30 p-4 rounded-lg border border-border">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-foreground">Total Amount:</span>
              <span className="text-3xl font-bold text-primary">${total.toFixed(2)}</span>
            </div>
          </div>

          <Tabs defaultValue="cash" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12 bg-muted rounded-lg">
              <TabsTrigger
                value="cash"
                className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:rounded-md transition-all"
              >
                <Banknote className="h-4 w-4 mr-2" />
                Cash
              </TabsTrigger>
              <TabsTrigger
                value="card"
                className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:rounded-md transition-all"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Card
              </TabsTrigger>
              <TabsTrigger
                value="digital"
                className="text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm data-[state=active]:rounded-md transition-all"
              >
                <Smartphone className="h-4 w-4 mr-2" />
                Digital
              </TabsTrigger>
            </TabsList>

            <TabsContent value="cash" className="space-y-5 pt-4">
              <div>
                <Label htmlFor="cash-received" className="text-sm font-medium text-foreground">
                  Cash Received
                </Label>
                <Input
                  id="cash-received"
                  type="number"
                  step="0.01"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  placeholder="0.00"
                  className="mt-2 h-10 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
              {cashReceived && Number.parseFloat(cashReceived) >= total && (
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <p className="text-green-800 font-medium">
                    Change: <span className="font-bold">${(Number.parseFloat(cashReceived) - total).toFixed(2)}</span>
                  </p>
                </div>
              )}
              <Button
                onClick={handleCashPayment}
                className="w-full h-11 text-base font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
                disabled={!cashReceived || Number.parseFloat(cashReceived) < total || processing}
              >
                {processing ? "Processing..." : "Complete Cash Payment"}
              </Button>
            </TabsContent>

            <TabsContent value="card" className="space-y-4 pt-4">
              <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                <CreditCard className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Insert or tap your card</p>
                <Button
                  onClick={handleCardPayment}
                  className="w-full h-11 text-base font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Process Card Payment"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="digital" className="space-y-4 pt-4">
              <div className="text-center py-8 bg-muted/30 rounded-lg border border-border">
                <Smartphone className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Scan QR code or use digital wallet</p>
                <Button
                  onClick={handleDigitalPayment}
                  className="w-full h-11 text-base font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Process Digital Payment"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
