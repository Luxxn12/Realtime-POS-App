import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { cart, total, paymentMethod, customerId } = await request.json()

    // created_by otomatis terisi auth.uid() (lihat DEFAULT di kolom)
    const { data: order, error: orderErr } = await supabaseServer
      .from("orders")
      .insert({
        customer_id: customerId,
        total_amount: total,
        tax_amount: total * 0.1,
        payment_method: paymentMethod,
        payment_status: "completed",
      })
      .select()
      .single()

    if (orderErr) throw orderErr

    // insert order_items
    const orderItems = cart.map((i: any) => ({
      order_id: order.id,
      product_id: i.id,
      quantity: i.quantity,
      unit_price: i.price,
      total_price: i.price * i.quantity,
    }))

    const { error: itemsErr } = await supabaseServer.from("order_items").insert(orderItems)
    if (itemsErr) throw itemsErr

    // kurangi stok
    for (const i of cart) {
      await supabaseServer
        .from("products")
        .update({ stock: i.stock - i.quantity })
        .eq("id", i.id)
    }

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (e) {
    console.error("Order creation error:", e)
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { data: orders, error } = await supabaseServer
      .from("orders")
      .select(
        `
          *,
          customers ( name, email ),
          user_profiles!orders_created_by_fkey ( full_name ),
          order_items (
            *,
            products ( name, price )
          )
        `,
      )
      .order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json(orders)
  } catch (e) {
    console.error("Orders fetch error:", e)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
