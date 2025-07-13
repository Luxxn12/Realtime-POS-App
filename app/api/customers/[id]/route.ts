import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("Updating customer:", params.id, body)

    const { data, error } = await supabaseServer
      .from("customers")
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Customer update error:", error)
      throw error
    }

    console.log("Customer updated successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Customer update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update customer",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Deleting customer:", params.id)

    const { error } = await supabaseServer.from("customers").delete().eq("id", params.id)

    if (error) {
      console.error("Customer delete error:", error)
      throw error
    }

    console.log("Customer deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Customer delete error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete customer",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
