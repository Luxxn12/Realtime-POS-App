"use client"

import { Badge } from "@/components/ui/badge"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { UserDialog } from "@/components/users/user-dialog"
import Image from "next/image"

export default function ProfilePage() {
  const { user, userProfile, loading } = useAuth()
  const [userDialogOpen, setUserDialogOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-destructive">You must be logged in to view this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="rounded-xl shadow-md border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <User className="h-6 w-6 text-primary" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-primary/50 shadow-md">
                <Image
                  src={userProfile?.avatar_url || "/placeholder.svg"}
                  alt="User Avatar"
                  width={112} // Explicit width
                  height={112} // Explicit height
                  objectFit="cover"
                />
              </div>
              <h2 className="text-3xl font-bold text-foreground">{userProfile?.full_name || "N/A"}</h2>
              <p className="text-lg text-muted-foreground">{user.email}</p>
              <Badge
                variant={userProfile?.role === "admin" ? "default" : "secondary"}
                className="text-base px-4 py-1 capitalize"
              >
                {userProfile?.role || "N/A"}
              </Badge>
            </div>

            <div className="space-y-3 text-center">
              <p className="text-sm text-muted-foreground">
                User ID: <span className="font-mono text-foreground">{user.id}</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Account Created:{" "}
                <span className="font-medium text-foreground">{new Date(user.created_at).toLocaleDateString()}</span>
              </p>
              {userProfile?.updated_at && (
                <p className="text-sm text-muted-foreground">
                  Profile Last Updated:{" "}
                  <span className="font-medium text-foreground">
                    {new Date(userProfile.updated_at).toLocaleDateString()}
                  </span>
                </p>
              )}
            </div>

            <Button
              onClick={() => setUserDialogOpen(true)}
              className="w-full h-11 text-base font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
            >
              Edit Profile
            </Button>
          </CardContent>
        </Card>
      </div>

      <UserDialog open={userDialogOpen} onOpenChange={setUserDialogOpen} userProfile={userProfile} />
    </div>
  )
}
