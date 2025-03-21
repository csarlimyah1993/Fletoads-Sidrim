"use client"

import { useState, useRef } from "react"
import { QRCodeSVG } from "qrcode.react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Download, Share2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface QRCodeGeneratorProps {
  url: string
  storeName: string
  logoUrl?: string
}

export function QRCodeGenerator({ url, storeName, logoUrl }: QRCodeGeneratorProps) {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const qrCodeRef = useRef<HTMLDivElement>(null)

  // Função para baixar o QR Code como PNG
  const downloadQRCode = () => {
    if (!qrCodeRef.current) return

    setIsGenerating(true)

    try {
      const canvas = document.createElement("canvas")
      const svg = qrCodeRef.current.querySelector("svg")
      const svgData = new XMLSerializer().serializeToString(svg!)
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext("2d")!
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)

        // Adicionar texto abaixo do QR Code
        ctx.font = "bold 14px Arial"
        ctx.fillStyle = "#000000"
        ctx.textAlign = "center"
        ctx.fillText(`Escaneie para acessar ${storeName}`, canvas.width / 2, canvas.height - 10)

        const dataUrl = canvas.toDataURL("image/png")
        const link = document.createElement("a")
        link.download = `qrcode-${storeName.toLowerCase().replace(/\s+/g, "-")}.png`
        link.href = dataUrl
        link.click()

        setIsGenerating(false)
        toast({
          title: "QR Code baixado com sucesso!",
          description: "O arquivo foi salvo na sua pasta de downloads.",
        })
      }

      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`
    } catch (error) {
      console.error("Erro ao baixar QR Code:", error)
      setIsGenerating(false)
      toast({
        title: "Erro ao baixar QR Code",
        description: "Ocorreu um erro ao gerar o arquivo. Tente novamente.",
        variant: "destructive",
      })
    }
  }

  // Função para imprimir o QR Code
  const printQRCode = () => {
    if (!qrCodeRef.current) return

    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      toast({
        title: "Erro ao abrir janela de impressão",
        description: "Verifique se o bloqueador de pop-ups está desativado.",
        variant: "destructive",
      })
      return
    }

    const svg = qrCodeRef.current.querySelector("svg")
    const svgData = new XMLSerializer().serializeToString(svg!)

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${storeName}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              padding: 20px;
              box-sizing: border-box;
            }
            .qr-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 20px;
              border: 1px solid #ccc;
              border-radius: 8px;
            }
            h2 {
              margin-bottom: 10px;
              text-align: center;
            }
            p {
              margin-top: 15px;
              text-align: center;
              font-size: 14px;
            }
            .logo {
              margin-bottom: 15px;
              max-width: 80px;
              max-height: 80px;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            ${logoUrl ? `<img src="${logoUrl}" alt="${storeName}" class="logo" />` : ""}
            <h2>${storeName}</h2>
            ${svgData}
            <p>Escaneie este QR Code para acessar nossa loja online</p>
          </div>
          <div class="no-print" style="margin-top: 30px;">
            <button onclick="window.print()">Imprimir</button>
            <button onclick="window.close()">Fechar</button>
          </div>
          <script>
            // Imprimir automaticamente
            setTimeout(() => {
              document.querySelector('.no-print').style.display = 'none';
              window.print();
              document.querySelector('.no-print').style.display = 'block';
            }, 500);
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  // Função para compartilhar o QR Code
  const shareQRCode = async () => {
    if (!navigator.share) {
      toast({
        title: "Compartilhamento não suportado",
        description: "Seu navegador não suporta a API de compartilhamento.",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.share({
        title: `QR Code - ${storeName}`,
        text: `Escaneie este QR Code para acessar a loja ${storeName}`,
        url: url,
      })

      toast({
        title: "Link compartilhado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao compartilhar:", error)
      toast({
        title: "Erro ao compartilhar",
        description: "Ocorreu um erro ao compartilhar o link.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card>
      <CardContent className="p-6 flex flex-col items-center">
        <div ref={qrCodeRef} className="bg-white p-4 rounded-lg mb-4">
          <QRCodeSVG
            value={url}
            size={200}
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

        <p className="text-sm text-center text-muted-foreground mb-4">
          Escaneie este QR Code para acessar a vitrine da loja
        </p>

        <div className="flex flex-wrap gap-2 justify-center">
          <Button variant="outline" size="sm" onClick={printQRCode} className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadQRCode}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isGenerating ? "Gerando..." : "Baixar PNG"}
          </Button>

          <Button variant="outline" size="sm" onClick={shareQRCode} className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

