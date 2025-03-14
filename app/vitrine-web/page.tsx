import { Header } from "@/components/header"
import { VitrineWebContent } from "@/components/vitrine-web-content"

export default function VitrineWebPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <VitrineWebContent />
      </div>
    </>
  )
}

