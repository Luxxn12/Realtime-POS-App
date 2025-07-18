import { SupabaseTest } from "@/components/debug/supabase-test"

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
        <SupabaseTest />
      </div>
    </div>
  )
}
