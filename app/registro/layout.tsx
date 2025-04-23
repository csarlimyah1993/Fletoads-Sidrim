import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Registro de Visitante | FletoAds",
  description: "Registre-se para participar de eventos e acessar vitrines exclusivas.",
}

export default function RegistroLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
