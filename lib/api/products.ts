export interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  barcode?: string | null
  image_url?: string | null // Added image_url
  created_at?: string
  updated_at?: string
  created_by?: string
  updated_by?: string
  user_profiles?: {
    full_name: string
  }
}

export async function getProducts(): Promise<Product[]> {
  try {
    const res = await fetch("/api/products", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    console.log("Fetched products:", data)
    return data
  } catch (error) {
    console.error("Error fetching products:", error)
    throw new Error("Failed to fetch products")
  }
}

export async function createProduct(
  product: Omit<Product, "id" | "created_at" | "updated_at" | "created_by" | "updated_by">,
) {
  try {
    console.log("Creating product:", product)

    const res = await fetch("/api/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.details || errorData.error || "Failed to create product")
    }

    const data = await res.json()
    console.log("Product created:", data)
    return data
  } catch (error) {
    console.error("Error creating product:", error)
    throw error
  }
}

export async function updateProduct(id: string, product: Partial<Product>) {
  try {
    console.log("Updating product:", id, product)

    const res = await fetch(`/api/products/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(product),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.details || errorData.error || "Failed to update product")
    }

    const data = await res.json()
    console.log("Product updated:", data)
    return data
  } catch (error) {
    console.error("Error updating product:", error)
    throw error
  }
}

export async function deleteProduct(id: string) {
  try {
    console.log("Deleting product:", id)

    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.details || errorData.error || "Failed to delete product")
    }

    console.log("Product deleted successfully")
    return true
  } catch (error) {
    console.error("Error deleting product:", error)
    throw error
  }
}
