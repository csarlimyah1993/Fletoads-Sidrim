import type { Metadata } from "next"
import ContratoClient from "./client"

export const metadata: Metadata = {
  title: "Contrato - FletoAds",
  description: "Revise e aceite os termos do contrato para ativar seu plano FletoAds.",
}

export default function ContratoPage() {
  return <ContratoClient />
}
