"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { deleteProduct } from "@/lib/api/products"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface DeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: any
}

export function DeleteProductDialog({ open, onOpenChange, product }: DeleteProductDialogProps) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] })
      toast({
        title: "Success",
        description: "Product deleted successfully",
      })
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive",
      })
    },
  })

  const handleDelete = () => {
    if (product?.id) {
      deleteMutation.mutate(product.id)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] rounded-xl shadow-lg border border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-foreground">Delete Product</DialogTitle>
        </DialogHeader>
        <div className="py-4 text-foreground">
          <p>
            Are you sure you want to delete "<span className="font-semibold">{product?.name}</span>"? This action cannot
            be undone.
          </p>
        </div>
        <DialogFooter className="pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-11 text-base font-semibold rounded-md"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="h-11 text-base font-semibold rounded-md shadow-md hover:shadow-lg transition-all"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
