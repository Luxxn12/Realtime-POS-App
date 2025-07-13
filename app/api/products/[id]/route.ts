import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("Updating product:", params.id, body)

    const updateData = {
      name: body.name,
      price: Number(body.price),
      category: body.category,
      stock: Number(body.stock),
      barcode: body.barcode || null,
      ...(body.image_url ? { image_url: body.image_url } : {}),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabaseServer
      .from("products")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Product update error:", error)
      throw error
    }

    console.log("Product updated successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Product update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update product",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("Deleting product:", params.id)

    const { error } = await supabaseServer.from("products").delete().eq("id", params.id)

    if (error) {
      console.error("Product delete error:", error)
      throw error
    }

    console.log("Product deleted successfully")
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Product delete error:", error)
    return NextResponse.json(
      {
        error: "Failed to delete product",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
