import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
  barcode?: string
}

interface CartItem extends Product {
  quantity: number
}

interface POSStore {
  cart: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const usePOSStore = create<POSStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addToCart: (product) => {
        const cart = get().cart
        const existingItem = cart.find((item) => item.id === product.id)

        if (existingItem) {
          set({
            cart: cart.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)),
          })
        } else {
          set({
            cart: [...cart, { ...product, quantity: 1 }],
          })
        }
      },

      removeFromCart: (productId) => {
        set({
          cart: get().cart.filter((item) => item.id !== productId),
        })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId)
          return
        }

        set({
          cart: get().cart.map((item) => (item.id === productId ? { ...item, quantity } : item)),
        })
      },

      clearCart: () => {
        set({ cart: [] })
      },

      getTotal: () => {
        return get().cart.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: "pos-cart-storage",
    },
  ),
)
