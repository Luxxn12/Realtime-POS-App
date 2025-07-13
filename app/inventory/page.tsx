"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Plus, Edit, Trash2, Package } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { getProducts } from "@/lib/api/products"
import { ProductDialog } from "@/components/inventory/product-dialog"
import { DeleteProductDialog } from "@/components/inventory/delete-product-dialog"
import Image from "next/image" // Import Next.js Image component

export default function InventoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState(null)

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  })

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setProductDialogOpen(true)
  }

  const handleEditProduct = (product) => {
    setSelectedProduct(product)
    setProductDialogOpen(true)
  }

  const handleDeleteProduct = (product) => {
    setProductToDelete(product)
    setDeleteDialogOpen(true)
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
                <Package className="h-6 w-6 text-primary" />
                Inventory Management
              </CardTitle>
              <Button onClick={handleAddProduct} className="h-10 px-4 text-base font-semibold rounded-md shadow-sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </div>
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
                    <TableHead className="text-foreground">Product</TableHead>
                    <TableHead className="text-foreground">Category</TableHead>
                    <TableHead className="text-foreground">Price</TableHead>
                    <TableHead className="text-foreground">Stock</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center overflow-hidden relative border border-border">
                            {product.image_url ? (
                              <Image
                                src={product.image_url || "/placeholder.svg"}
                                alt={product.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-lg"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.barcode || "N/A"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">{product.category}</TableCell>
                      <TableCell className="text-foreground">${product.price.toFixed(2)}</TableCell>
                      <TableCell className="text-foreground">{product.stock}</TableCell>
                      <TableCell>
                        <Badge
                          variant={product.stock > 10 ? "default" : product.stock > 0 ? "secondary" : "destructive"}
                          className="capitalize"
                        >
                          {product.stock > 10 ? "In Stock" : product.stock > 0 ? "Low Stock" : "Out of Stock"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProduct(product)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit product</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProduct(product)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete product</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProductDialog open={productDialogOpen} onOpenChange={setProductDialogOpen} product={selectedProduct} />
      <DeleteProductDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} product={productToDelete} />
    </div>
  )
}
