import { SessionDebug } from "@/components/session-debug"

export default function DebugSessionPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Depuração de Sessão</h1>
      <SessionDebug />
    </div>
  )
}
