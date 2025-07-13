import { type NextRequest, NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Fetch user profiles, ordered by full_name
    const { data: userProfiles, error } = await supabaseServer.from("user_profiles").select("*").order("full_name")

    if (error) {
      console.error("User profiles fetch error:", error)
      throw error
    }

    return NextResponse.json(userProfiles || [])
  } catch (error) {
    console.error("User profiles fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch user profiles" }, { status: 500 })
  }
}

// POST for creating users is typically handled by the signup flow (signInWithOtp)
// or by an admin inviting users. Direct creation via this API might bypass auth.users table.
// For simplicity, we'll focus on GET and PATCH for existing profiles.
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: "User creation not supported via this endpoint. Use signup flow." },
    { status: 405 },
  )
}
