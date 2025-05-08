import { AuthDebug } from "@/components/auth-debug"

export default function DebugAuthPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Depuração de Autenticação</h1>
      <AuthDebug />
    </div>
  )
}
