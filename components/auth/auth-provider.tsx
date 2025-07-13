"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase/client"
import { useRouter, usePathname } from "next/navigation"
import { useQuery } from "@tanstack/react-query" // Import useQuery
import { useRealtimeUserProfiles } from "@/lib/hooks/use-realtime"
import { getUserProfile, type UserProfile } from "@/lib/api/users" // Import getUserProfile and UserProfile type

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true) // Initial loading for Supabase session
  const router = useRouter()
  const pathname = usePathname()

  // Use useQuery for userProfile, which will automatically refetch on invalidation
  const {
    data: userProfile,
    isLoading: isProfileLoading,
    error: profileError,
  } = useQuery({
    queryKey: ["user_profiles", user?.id], // Include user.id in query key
    queryFn: async ({ queryKey }) => {
      const userId = queryKey[1] as string
      if (!userId) {
        return null
      }
      return getUserProfile(userId)
    },
    enabled: !!user, // Only fetch profile if user object exists
    staleTime: 5 * 60 * 1000, // 5 minutes, you can adjust this
    refetchOnWindowFocus: false, // Prevents refetching on tab focus by default
  })

  // Enable real-time updates for user profiles, which will invalidate the 'user_profiles' query
  useRealtimeUserProfiles()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes from Supabase SDK
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email)
      setUser(session?.user ?? null)
      setLoading(false) // Auth state change means initial loading is done
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  // Redirect to login if not authenticated (except for login and auth callback pages)
  useEffect(() => {
    // Only redirect if not loading (initial session check complete) and user is null
    if (!loading && !user && pathname !== "/login" && !pathname.startsWith("/auth/")) {
      router.push("/login")
    }
  }, [user, loading, pathname, router])

  // Redirect to dashboard if authenticated and on login page
  useEffect(() => {
    // Only redirect if not loading (initial session check complete) and user exists
    if (!loading && user && pathname === "/login") {
      router.push("/")
    }
  }, [user, loading, pathname, router])

  // The overall loading state for the AuthProvider
  const combinedLoading = loading || isProfileLoading

  return (
    <AuthContext.Provider value={{ user, userProfile: userProfile || null, loading: combinedLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
