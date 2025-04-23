"use client"

import { useSession } from "next-auth/react"
import { getUserFromSession } from "@/lib/session-utils"

export function UserSessionDisplay() {
  const { data: session, status } = useSession()
  const user = getUserFromSession(session)

  if (status === "loading") {
    return <div>Carregando...</div>
  }

  if (status === "unauthenticated" || !user) {
    return <div>Não autenticado</div>
  }

  return (
    <div className="p-4 border rounded-md">
      <h2 className="font-bold mb-2">Dados do Usuário</h2>
      <p>
        <strong>Nome:</strong> {user.name || user.nome || "N/A"}
      </p>
      <p>
        <strong>Email:</strong> {user.email || "N/A"}
      </p>
      <p>
        <strong>Função:</strong> {user.role || "N/A"}
      </p>
      <p>
        <strong>Tipo:</strong> {user.tipoUsuario || "N/A"}
      </p>
    </div>
  )
}
