export interface Order {
  id: string
  customer_id?: string
  total_amount: number
  tax_amount: number
  payment_method: string
  payment_status: string
  created_at: string
  customers?: {
    name: string
    email: string
  }
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  unit_price: number
  total_price: number
  products?: {
    name: string
    price: number
  }
}

export async function createOrder(orderData: {
  cart: any[]
  total: number
  paymentMethod: string
  customerId?: string
}) {
  try {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.details || errorData.error || "Failed to create order")
    }

    const data = await res.json()
    console.log("Order created:", data)
    return data
  } catch (error) {
    console.error("Error creating order:", error)
    throw error
  }
}

export async function getOrders(): Promise<Order[]> {
  try {
    const res = await fetch("/api/orders", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    console.log("Fetched orders:", data)
    return data
  } catch (error) {
    console.error("Error fetching orders:", error)
    throw new Error("Failed to fetch orders")
  }
}
