"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { FileText, Upload, Loader2, File, Download, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export interface DocumentInfo {
  id: string
  nome: string
  url: string
  tipo: string
  tamanho: number
  dataCriacao: Date
}

interface DocumentUploadProps {
  value: DocumentInfo[]
  onChange: (documents: DocumentInfo[]) => void
  maxFiles?: number
  allowedTypes?: string[]
  maxSize?: number // in MB
}

export function DocumentUpload({
  value = [],
  onChange,
  maxFiles = 10,
  allowedTypes = [".pdf", ".doc", ".docx", ".txt", ".xls", ".xlsx", ".ppt", ".pptx"],
  maxSize = 10, // 10MB default
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      // Check if adding these files would exceed the max
      if (value.length + files.length > maxFiles) {
        toast.error(`Você pode enviar no máximo ${maxFiles} documentos`)
        return
      }

      setIsUploading(true)
      setUploadProgress(0)

      const uploadPromises = Array.from(files).map(async (file) => {
        // Check file type
        const fileExtension = `.${file.name.split(".").pop()?.toLowerCase()}`
        if (!allowedTypes.includes(fileExtension) && !allowedTypes.includes("*")) {
          toast.error(`Tipo de arquivo não permitido: ${fileExtension}`)
          return null
        }

        // Check file size
        const fileSizeMB = file.size / (1024 * 1024)
        if (fileSizeMB > maxSize) {
          toast.error(`Arquivo muito grande: ${file.name} (${fileSizeMB.toFixed(2)}MB). Máximo: ${maxSize}MB`)
          return null
        }

        try {
          // Create form data
          const formData = new FormData()
          formData.append("file", file)

          // Upload file
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || "Erro ao enviar arquivo")
          }

          const data = await response.json()

          // Return document info
          return {
            id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
            nome: file.name,
            url: data.url,
            tipo: file.type,
            tamanho: file.size,
            dataCriacao: new Date(),
          }
        } catch (error) {
          console.error("Erro ao enviar arquivo:", error)
          toast.error(`Erro ao enviar ${file.name}`)
          return null
        }
      })

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 5
          return newProgress >= 95 ? 95 : newProgress
        })
      }, 100)

      try {
        const results = await Promise.all(uploadPromises)
        const validResults = results.filter((result): result is DocumentInfo => result !== null)

        // Update the documents list
        onChange([...value, ...validResults])
        setUploadProgress(100)

        if (validResults.length > 0) {
          toast.success(
            `${validResults.length} ${validResults.length === 1 ? "documento enviado" : "documentos enviados"} com sucesso`,
          )
        }
      } catch (error) {
        console.error("Erro ao processar uploads:", error)
        toast.error("Ocorreu um erro ao processar os uploads")
      } finally {
        clearInterval(progressInterval)
        setIsUploading(false)
        // Reset the input
        e.target.value = ""
      }
    },
    [value, onChange, maxFiles, allowedTypes, maxSize],
  )

  const handleRemoveDocument = useCallback(
    (id: string) => {
      onChange(value.filter((doc) => doc.id !== id))
      toast.success("Documento removido")
    },
    [value, onChange],
  )

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return <FileText className="h-5 w-5 text-red-500" />
    if (mimeType.includes("word") || mimeType.includes("doc")) return <FileText className="h-5 w-5 text-blue-500" />
    if (mimeType.includes("excel") || mimeType.includes("sheet") || mimeType.includes("xls"))
      return <FileText className="h-5 w-5 text-green-500" />
    if (mimeType.includes("powerpoint") || mimeType.includes("presentation") || mimeType.includes("ppt"))
      return <FileText className="h-5 w-5 text-orange-500" />
    return <File className="h-5 w-5 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors",
          isUploading ? "bg-gray-50 dark:bg-gray-900/50" : "bg-white dark:bg-gray-950",
        )}
      >
        <Input
          type="file"
          id="documentUpload"
          className="hidden"
          onChange={handleFileChange}
          multiple
          disabled={isUploading || value.length >= maxFiles}
          accept={allowedTypes.join(",")}
        />

        <Label
          htmlFor="documentUpload"
          className={cn(
            "flex flex-col items-center justify-center gap-2 cursor-pointer",
            (isUploading || value.length >= maxFiles) && "opacity-50 cursor-not-allowed",
          )}
        >
          {isUploading ? (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
              <div className="text-sm font-medium">Enviando documentos...</div>
              <div className="w-full max-w-xs h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${uploadProgress}%`, transition: "width 0.3s ease-in-out" }}
                />
              </div>
            </>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div className="text-sm font-medium">
                {value.length >= maxFiles
                  ? `Limite máximo de ${maxFiles} documentos atingido`
                  : "Clique para enviar documentos"}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Formatos aceitos: {allowedTypes.join(", ")}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Tamanho máximo: {maxSize}MB</p>
            </>
          )}
        </Label>
      </div>

      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Documentos enviados ({value.length})</h4>
          <div className="border rounded-md divide-y">
            {value.map((doc) => (
              <div key={doc.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getFileIcon(doc.tipo)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.nome}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatFileSize(doc.tamanho)} • {new Date(doc.dataCriacao).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" title="Baixar">
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveDocument(doc.id)}
                    title="Remover"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
