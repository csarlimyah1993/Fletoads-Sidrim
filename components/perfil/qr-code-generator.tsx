"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Share2, ExternalLink } from "lucide-react"
import QRCode from "qrcode.react"

interface QRCodeGeneratorProps {
  url?: string
  storeName: string
  storeId: string
  logoUrl?: string
}

export function QRCodeGenerator({ url, storeName, storeId, logoUrl }: QRCodeGeneratorProps) {
  const [mounted, setMounted] = useState(false)

  // Usar o ID da loja para gerar a URL da vitrine
  const vitrineUrl = url || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/vitrine/${storeId}`

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleDownload = () => {
    const canvas = document.getElementById("qr-code") as HTMLCanvasElement
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream")

      const downloadLink = document.createElement("a")
      downloadLink.href = pngUrl
      downloadLink.download = `${storeName.replace(/\s+/g, "-").toLowerCase()}-qrcode.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `QR Code da ${storeName}`,
          text: `Escaneie este QR Code para acessar ${storeName}`,
          url: vitrineUrl,
        })
      } catch (error) {
        console.error("Erro ao compartilhar:", error)
      }
    } else {
      // Fallback para copiar o link
      navigator.clipboard.writeText(vitrineUrl)
      alert("Link copiado para a área de transferência!")
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>QR Code da Loja</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="bg-white p-4 rounded-lg">
          <QRCode
            id="qr-code"
            value={vitrineUrl}
            size={180}
            level="H"
            includeMargin={true}
            imageSettings={
              logoUrl
                ? {
                    src: logoUrl,
                    x: undefined,
                    y: undefined,
                    height: 40,
                    width: 40,
                    excavate: true,
                  }
                : undefined
            }
          />
        </div>
        <p className="text-sm text-center text-muted-foreground">Escaneie este QR Code para acessar sua loja online</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Baixar
          </Button>
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Compartilhar
          </Button>
        </div>
        <Button variant="link" size="sm" className="text-xs" onClick={() => window.open(vitrineUrl, "_blank")}>
          Visualizar vitrine
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  )
}

