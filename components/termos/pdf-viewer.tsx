"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink, FileText, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PdfViewerProps {
  title: string
  pdfPath: string
  description: string
  fallbackPdfPath?: string
}

export function PdfViewer({ title, pdfPath, description, fallbackPdfPath }: PdfViewerProps) {
  const [pdfExists, setPdfExists] = useState(true)
  const [currentPath, setCurrentPath] = useState(pdfPath)

  useEffect(() => {
    // Verificar se o PDF existe
    const checkPdfExists = async () => {
      try {
        const response = await fetch(pdfPath, { method: "HEAD" })
        if (!response.ok && fallbackPdfPath) {
          // Tentar o caminho alternativo
          const fallbackResponse = await fetch(fallbackPdfPath, { method: "HEAD" })
          if (fallbackResponse.ok) {
            setCurrentPath(fallbackPdfPath)
            setPdfExists(true)
          } else {
            setPdfExists(false)
          }
        } else if (!response.ok) {
          setPdfExists(false)
        }
      } catch (error) {
        console.error("Erro ao verificar PDF:", error)
        setPdfExists(false)
      }
    }

    checkPdfExists()
  }, [pdfPath, fallbackPdfPath])

  if (!pdfExists) {
    return (
      <Alert variant="destructive" className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Documento não encontrado</AlertTitle>
        <AlertDescription>
          Não foi possível carregar o documento "{title}". Por favor, entre em contato com o suporte.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm overflow-hidden mb-8">
      <div className="flex flex-col space-y-1.5 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-2xl font-semibold leading-none tracking-tight">{title}</h3>
          </div>
          <Button variant="outline" size="sm" asChild>
            <a href={currentPath} download>
              <Download className="h-4 w-4 mr-2" />
              Download
            </a>
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="p-0 pt-0">
        <div className="h-[500px] w-full border-t">
          <iframe src={currentPath} className="w-full h-full" onError={() => setPdfExists(false)} />
        </div>
      </div>
      <div className="flex items-center p-4 bg-muted/50">
        <a
          href={currentPath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center"
        >
          Abrir em nova aba
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  )
}
