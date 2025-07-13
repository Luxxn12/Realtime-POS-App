export interface UserProfile {
  id: string
  full_name: string | null
  role: string | null
  avatar_url: string | null
  created_at?: string
  updated_at?: string
}

export async function getUserProfiles(): Promise<UserProfile[]> {
  try {
    const res = await fetch("/api/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    console.log("Fetched user profiles:", data)
    return data
  } catch (error) {
    console.error("Error fetching user profiles:", error)
    throw new Error("Failed to fetch user profiles")
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`/api/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Pastikan untuk selalu mendapatkan data terbaru
    })

    if (!res.ok) {
      // If the API returns 200 with null (no profile found), handle it
      if (res.status === 200) {
        return null
      }
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    console.log("Fetched single user profile:", data)
    return data
  } catch (error) {
    console.error(`Error fetching user profile for ${userId}:`, error)
    throw error // Re-throw to let useQuery handle it
  }
}

export async function updateUserProfile(id: string, profile: Partial<UserProfile>) {
  try {
    console.log("Updating user profile:", id, profile)

    const res = await fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profile),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.details || errorData.error || "Failed to update user profile")
    }

    const data = await res.json()
    console.log("User profile updated:", data)
    return data
  } catch (error) {
    console.error("Error updating user profile:", error)
    throw error
  }
}
