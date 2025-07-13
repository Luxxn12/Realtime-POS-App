import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"
import { createClient } from "@supabase/supabase-js"

// Create authenticated client for getting user info
async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return null

  const token = authHeader.replace("Bearer ", "")
  const supabaseAuth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  const {
    data: { user },
  } = await supabaseAuth.auth.getUser(token)
  return user
}

export async function GET() {
  try {
    const { data: products, error } = await supabaseServer.from("products").select("*").order("name")

    if (error) {
      console.error("Products fetch error:", error)
      throw error
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error("Products fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json()
    console.log("Creating product:", product)

    // Get current user from session
    const cookieStore = request.headers.get("cookie")
    const supabaseAuth = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

    // For now, we'll use service role to create products
    // In production, you'd want to validate the user session properly
    // Build payload; include image_url only if provided
    const insertData = {
      name: product.name,
      price: Number(product.price),
      category: product.category,
      stock: Number(product.stock),
      barcode: product.barcode || null,
      ...(product.image_url ? { image_url: product.image_url } : {}),
    }

    const { data, error } = await supabaseServer.from("products").insert(insertData).select("*").single()

    if (error) {
      console.error("Product creation error:", error)
      throw error
    }

    console.log("Product created successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Product creation error:", error)
    return NextResponse.json(
      {
        error: "Failed to create product",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
