import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: userProfile, error } = await supabaseServer
      .from("user_profiles")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found, return null and 200 OK
        return NextResponse.json(null, { status: 200 })
      }
      console.error("User profile fetch error:", error)
      throw error
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error("User profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user profile" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    console.log("Updating user profile:", params.id, body)

    const { data, error } = await supabaseServer
      .from("user_profiles")
      .update({
        full_name: body.full_name,
        role: body.role,
        avatar_url: body.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("User profile update error:", error)
      throw error
    }

    console.log("User profile updated successfully:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("User profile update error:", error)
    return NextResponse.json(
      {
        error: "Failed to update user profile",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Deleting a user profile should typically cascade from deleting the auth.users entry,
// which is a more complex and sensitive operation.
export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  return NextResponse.json({ error: "User deletion not supported via this endpoint." }, { status: 405 })
}
