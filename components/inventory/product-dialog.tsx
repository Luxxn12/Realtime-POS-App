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
import { createProduct, updateProduct } from "@/lib/api/products"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Image from "next/image" // Import Next.js Image component
import { XCircle } from "lucide-react" // For clear image button

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
  barcode: z.string().optional(),
  image_url: z.string().optional().nullable(), // Added image_url to schema
})

type ProductForm = z.infer<typeof productSchema>

interface ProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: any
}

export function ProductDialog({ open, onOpenChange, product }: ProductDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null) // Keep track of the actual file

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
  })

  const selectedCategory = watch("category")

  useEffect(() => {
    if (product) {
      setValue("name", product.name)
      setValue("price", product.price)
      setValue("category", product.category)
      setValue("stock", product.stock)
      setValue("barcode", product.barcode || "")
      setValue("image_url", product.image_url || null) // Set existing image URL in form state
      setImagePreviewUrl(product.image_url || null) // Set existing image URL for preview
      setSelectedImageFile(null) // No new file selected initially for existing product
    } else {
      reset()
      setImagePreviewUrl(null)
      setSelectedImageFile(null)
    }
  }, [product, setValue, reset])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string)
        setValue("image_url", reader.result as string) // Update form state with Data URL
      }
      reader.readAsDataURL(file)
    } else {
      setSelectedImageFile(null)
      setImagePreviewUrl(null)
      setValue("image_url", null) // Clear image_url in form state
    }
  }

  const handleClearImage = () => {
    setSelectedImageFile(null)
    setImagePreviewUrl(null)
    setValue("image_url", null) // Clear image_url in form state
    // Clear the file input value as well
    const fileInput = document.getElementById("product-image") as HTMLInputElement
    if (fileInput) {
      fileInput.value = ""
    }
  }

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Success",
        description: "Product created successfully",
      })
      onOpenChange(false)
      reset()
      setImagePreviewUrl(null) // Clear preview after successful creation
      setSelectedImageFile(null)
    },
    onError: (error: Error) => {
      console.error("Create product error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive",
      })
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      onOpenChange(false)
      reset()
      setImagePreviewUrl(null) // Clear preview after successful update
      setSelectedImageFile(null)
    },
    onError: (error: Error) => {
      console.error("Update product error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: ProductForm) => {
    console.log("Form submitted:", data)
    // The image_url is already in `data` because of setValue in handleImageChange
    const payload = { ...data }
    if (!payload.image_url) delete payload.image_url

    if (product) {
      updateMutation.mutate({ id: product.id, data: payload })
    } else {
      createMutation.mutate(payload)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-lg border border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 py-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Product Name
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter product name"
              className="mt-2 h-10 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-foreground">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                placeholder="0.00"
                className="mt-2 h-10 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              {errors.price && <p className="text-sm text-destructive mt-1">{errors.price.message}</p>}
            </div>

            <div>
              <Label htmlFor="stock" className="text-sm font-medium text-foreground">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", { valueAsNumber: true })}
                placeholder="0"
                className="mt-2 h-10 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
              />
              {errors.stock && <p className="text-sm text-destructive mt-1">{errors.stock.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="category" className="text-sm font-medium text-foreground">
              Category
            </Label>
            <Select value={selectedCategory} onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger className="mt-2 h-10 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beverages">Beverages</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Bakery">Bakery</SelectItem>
                <SelectItem value="Snacks">Snacks</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-destructive mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <Label htmlFor="barcode" className="text-sm font-medium text-foreground">
              Barcode (Optional)
            </Label>
            <Input
              id="barcode"
              {...register("barcode")}
              placeholder="Enter barcode"
              className="mt-2 h-10 px-4 rounded-md border border-input focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <Label htmlFor="product-image" className="text-sm font-medium text-foreground">
              Product Image (Optional)
            </Label>
            <Input
              id="product-image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-2 h-10 px-4 rounded-md border border-input file:text-primary file:font-semibold file:bg-transparent file:border-0 file:mr-2"
            />
            {imagePreviewUrl && (
              <div className="mt-4 relative w-32 h-32 border border-border rounded-lg overflow-hidden shadow-sm">
                <Image
                  src={imagePreviewUrl || "/placeholder.svg"}
                  alt="Product Preview"
                  layout="fill"
                  objectFit="cover"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-7 w-7 rounded-full bg-background/70 hover:bg-background text-muted-foreground hover:text-foreground"
                  onClick={handleClearImage}
                >
                  <XCircle className="h-4 w-4 text-destructive" />
                  <span className="sr-only">Clear image</span>
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
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : product ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
