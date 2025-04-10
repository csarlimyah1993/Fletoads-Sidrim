// Adicionando a definição de props para o componente DatabaseErrorFallback
import type { ReactNode } from "react"

export interface DatabaseErrorFallbackProps {
  children: ReactNode
  fallback?: ReactNode
}

export function DatabaseErrorFallback({ children, fallback }: DatabaseErrorFallbackProps) {
  return <>{children}</>
}
