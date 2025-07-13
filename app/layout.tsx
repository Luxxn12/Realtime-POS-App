import { AuthProvider } from "@/components/auth/auth-provider"
import { Navigation } from "@/components/layout/navigation"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import type React from "react"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "POS System - Real-time Point of Sale",
  description: "Modern POS system with real-time capabilities and secure authentication",
  icons: {
    icon: "/pos.png",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            <Navigation />
            {children}
            <Toaster />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
