import { Header } from "@/components/header"
import { PixelsContent } from "@/components/pixels-content"

export default function PixelsPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <PixelsContent />
      </div>
    </>
  )
}

