"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Edit, Users } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getUserProfiles } from "@/lib/api/users" // Changed from customers to users
import { UserDialog } from "@/components/users/user-dialog" // Changed from CustomerDialog to UserDialog
import { useRealtimeUserProfiles } from "@/lib/hooks/use-realtime" // Changed from useRealtimeCustomers

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [userDialogOpen, setUserDialogOpen] = useState(false)
  const [selectedUserProfile, setSelectedUserProfile] = useState(null) // Changed from selectedCustomer

  const {
    data: userProfiles = [], // Changed from customers
    isLoading,
    error,
  } = useQuery({
    queryKey: ["user_profiles"], // Changed queryKey
    queryFn: getUserProfiles, // Changed queryFn
  })

  // Enable real-time updates
  useRealtimeUserProfiles() // Changed hook

  const filteredUserProfiles = userProfiles.filter(
    (profile) =>
      profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUser = () => {
    // Direct user creation is via signup flow. This button can be for editing existing.
    setSelectedUserProfile(null)
    setUserDialogOpen(true)
  }

  const handleEditUser = (profile) => {
    setSelectedUserProfile(profile)
    setUserDialogOpen(true)
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to load user profiles</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <Card className="rounded-xl shadow-md border border-border">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <CardTitle className="flex items-center gap-2 text-2xl font-bold text-foreground">
                <Users className="h-6 w-6 text-primary" />
                User Management
              </CardTitle>
              {/* Removed "Add User" button for direct creation, as it's handled by signup */}
              {/* <Button onClick={handleAddUser}>
                <Plus className="h-4 w-4 mr-1" />
                Add User
              </Button> */}
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-foreground">User</TableHead>
                    <TableHead className="text-foreground">Role</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUserProfiles.map((profile) => (
                    <TableRow key={profile.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-lg">
                            <span className="text-primary font-semibold">
                              {profile.full_name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{profile.full_name}</p>
                            <p className="text-sm text-muted-foreground">ID: {profile.id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {profile.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(profile)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit user</span>
                          </Button>
                          {/* Deleting users is sensitive and should be handled carefully, often not directly from UI */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredUserProfiles.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No users found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <UserDialog open={userDialogOpen} onOpenChange={setUserDialogOpen} userProfile={selectedUserProfile} />
    </div>
  )
}
