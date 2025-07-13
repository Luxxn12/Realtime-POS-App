"use client"

import { useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { useQueryClient } from "@tanstack/react-query"

export function useRealtimeProducts() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "products",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["products"] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}

export function useRealtimeOrders() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["orders"] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}

export function useRealtimeUserProfiles() {
  // Renamed hook
  const queryClient = useQueryClient()

  useEffect(() => {
    const channel = supabase
      .channel("user_profiles-changes") // Changed table name
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_profiles", // Changed table name
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["user_profiles"] }) // Changed queryKey
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])
}
