import { Suspense } from "react"
// Use the exact case that matches the actual file name
import VitrineClientPage from "./VitrineClientPage"

export default function VitrinePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <VitrineClientPage />
    </Suspense>
  )
}