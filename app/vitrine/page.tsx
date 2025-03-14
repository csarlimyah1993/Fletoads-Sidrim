import { Header } from "@/components/header"
import { VitrineContent } from "@/components/vitrine-content"

export default function VitrinePage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <VitrineContent />
      </div>
    </>
  )
}

