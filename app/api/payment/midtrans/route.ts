import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { orderId, amount } = await request.json()

    // Simulate Midtrans payment processing
    // In a real implementation, you would integrate with Midtrans API
    const paymentResponse = {
      transaction_id: `TXN_${Date.now()}`,
      order_id: orderId,
      gross_amount: amount,
      payment_type: "credit_card",
      transaction_status: "capture",
      fraud_status: "accept",
      transaction_time: new Date().toISOString(),
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return NextResponse.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.error("Payment processing error:", error)
    return NextResponse.json({ error: "Payment processing failed" }, { status: 500 })
  }
}
