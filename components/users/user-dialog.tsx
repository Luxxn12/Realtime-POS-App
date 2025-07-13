"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useToast } from "@/hooks/use-toast"
import { updateUserProfile } from "@/lib/api/users"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image" // Import Next.js Image component
import { XCircle } from "lucide-react" // For clear image button

const userProfileSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  role: z.string().min(1, "Role is required"),
  avatar_url: z.string().url("Invalid URL").optional().or(z.literal("")).nullable(), // Added nullable
})

type UserProfileForm = z.infer<typeof userProfileSchema>

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userProfile?: any
}

export function UserDialog({ open, onOpenChange, userProfile }: UserDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UserProfileForm>({
    resolver: zodResolver(userProfileSchema),
  })

  const selectedRole = watch("role")

  useEffect(() => {
    if (userProfile) {
      setValue("full_name", userProfile.full_name || "")
      setValue("role", userProfile.role || "admin")
      setValue("avatar_url", userProfile.avatar_url || null) // Set existing avatar URL in form state
      setAvatarPreviewUrl(userProfile.avatar_url || null) // Set existing avatar URL for preview
      setSelectedAvatarFile(null) // No new file selected initially for existing profile
    } else {
      reset()
      setAvatarPreviewUrl(null)
      setSelectedAvatarFile(null)
    }
  }, [userProfile, setValue, reset])

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreviewUrl(reader.result as string)
        setValue("avatar_url", reader.result as string) // Update form state with Data URL
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedAvatarFile(null)
      setAvatarPreviewUrl(null)
      setValue("avatar_url", null) // Clear avatar_url in form state
    }
  }

  const handleClearAvatar = () => {
    setSelectedAvatarFile(null)
    setAvatarPreviewUrl(null)
    setValue("avatar_url", null) // Clear avatar_url in form state
    // Clear the file input value as well
    const fileInput = document.getElementById("user-avatar") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUserProfile(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_profiles"] })
      toast({
        title: "Success",
        description: "User profile updated successfully",
      })
      onOpenChange(false)
      // No reset here, as we want to keep the updated data in the form if dialog reopens
      // The useEffect will handle resetting if a new userProfile is passed (which won't happen for self-edit)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user profile",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: UserProfileForm) => {
    console.log("User profile form submitted:", data)
    const payload = { ...data }
    // Only send avatar_url if it's explicitly set (not null or empty string)
    if (!payload.avatar_url) {
      payload.avatar_url = null // Ensure it's explicitly null if cleared
    }

    if (userProfile) {
      updateMutation.mutate({ id: userProfile.id, data: payload })
    }
    // Note: Creating new users is handled by the signup flow, not this dialog.
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-lg border border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {userProfile ? "Edit User Profile" : "Add New User (via Signup)"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div>
            <Label htmlFor="full_name" className="text-sm font-medium text-foreground">
              Full Name
            </Label>
            <Input
              id="full_name"
              {...register("full_name")}
              placeholder="Enter full name"
              className="mt-2 h-10 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
            {errors.full_name && <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>}
          </div>

          <div>
            <Label htmlFor="role" className="text-sm font-medium text-foreground">
              Role
            </Label>
            <Select value={selectedRole} onValueChange={(value) => setValue("role", value)}>
              <SelectTrigger className="mt-2 h-10 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive mt-1">{errors.role.message}</p>}
          </div>

          {/* Avatar Upload Section */}
          <div>
            <Label htmlFor="user-avatar" className="text-sm font-medium text-foreground">
              Avatar (Optional)
            </Label>
            <Input
              id="user-avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="mt-2 h-10 px-4 rounded-md border border-input file:text-primary file:font-semibold file:bg-transparent file:border-0 file:mr-2"
            />
            {avatarPreviewUrl && (
              <div className="mt-4 relative w-24 h-24 rounded-full overflow-hidden border-2 border-border shadow-sm">
                <Image
                  src={avatarPreviewUrl || "/placeholder.svg"}
                  alt="User Avatar Preview"
                  layout="fill"
                  objectFit="cover"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-0 right-0 h-7 w-7 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground"
                  onClick={handleClearAvatar}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Clear avatar</span>
                </Button>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 text-base font-semibold rounded-md"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 h-11 text-base font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
              disabled={updateMutation.isPending}
            >
              {updateMutation.isPending ? "Saving..." : "Update Profile"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
