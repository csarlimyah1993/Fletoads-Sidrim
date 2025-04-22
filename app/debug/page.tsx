import { SessionDebugger } from "@/components/session-debuger"

export default function DebugPage() {
  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <SessionDebugger />
    </div>
  )
}
