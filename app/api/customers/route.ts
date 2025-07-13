import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET() {
  try {
    const { data: customers, error } = await supabaseServer.from("customers").select("*").order("name")

    if (error) {
      console.error("Customers fetch error:", error)
      throw error
    }

    return NextResponse.json(customers || [])
  } catch (error) {
    console.error("Customers fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const customer = await request.json()
    console.log("Creating customer:", customer)

    const { data, error } = await supabaseServer
      .from("customers")
      .insert({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        total_orders: 0,
        total_spent: 0,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Customer creation error:", error)
      throw error
    }

    console.log("Customer created successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Customer creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create customer",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
