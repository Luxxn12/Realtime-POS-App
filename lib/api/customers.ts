export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  total_orders: number
  total_spent: number
  status: string
  created_at?: string
  updated_at?: string
}

export async function getCustomers(): Promise<Customer[]> {
  try {
    const res = await fetch("/api/customers", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`)
    }

    const data = await res.json()
    console.log("Fetched customers:", data)
    return data
  } catch (error) {
    console.error("Error fetching customers:", error)
    throw new Error("Failed to fetch customers")
  }
}

export async function createCustomer(
  customer: Omit<Customer, "id" | "total_orders" | "total_spent" | "created_at" | "updated_at">,
) {
  try {
    console.log("Creating customer:", customer)

    const res = await fetch("/api/customers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.details || errorData.error || "Failed to create customer")
    }

    const data = await res.json()
    console.log("Customer created:", data)
    return data
  } catch (error) {
    console.error("Error creating customer:", error)
    throw error
  }
}

export async function updateCustomer(id: string, customer: Partial<Customer>) {
  try {
    console.log("Updating customer:", id, customer)

    const res = await fetch(`/api/customers/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(customer),
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.details || errorData.error || "Failed to update customer")
    }

    const data = await res.json()
    console.log("Customer updated:", data)
    return data
  } catch (error) {
    console.error("Error updating customer:", error)
    throw error
  }
}

export async function deleteCustomer(id: string) {
  try {
    console.log("Deleting customer:", id)

    const res = await fetch(`/api/customers/${id}`, {
      method: "DELETE",
    })

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.details || errorData.error || "Failed to delete customer")
    }

    console.log("Customer deleted successfully")
    return true
  } catch (error) {
    console.error("Error deleting customer:", error)
    throw error
  }
}
