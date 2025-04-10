"use client"

import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import Image from "next/image"
import { Upload, X } from "lucide-react"

export interface ImageUploadProps {
  onChange: (value: string) => void
  onRemove: (value: string) => void
  value: string[]
  disabled?: boolean
  endpoint?: string
  onUploadComplete?: (url: string) => void
}

// Export as default instead of named export
export default function ImageUpload({
  onChange,
  onRemove,
  value,
  disabled,
  endpoint,
  onUploadComplete,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      setIsUploading(true)

      const file = acceptedFiles[0]

      if (!file || !endpoint) {
        setIsUploading(false)
        return
      }

      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch(`/api/${endpoint}`, {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Upload failed")
        }

        const data = await response.json()

        if (data.url) {
          onChange(data.url)
          if (onUploadComplete) {
            onUploadComplete(data.url)
          }
        }
      } catch (error) {
        console.error("Error uploading image:", error)
      } finally {
        setIsUploading(false)
      }
    },
    [onChange, endpoint, onUploadComplete],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
    disabled: disabled || isUploading,
    maxFiles: 1,
  })

  return (
    <div>
      <div
        {...getRootProps({
          className:
            "border-2 border-dashed border-primary/50 rounded-md p-4 transition flex flex-col items-center justify-center hover:opacity-70 cursor-pointer",
        })}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <Upload className="h-10 w-10 text-primary" />
          <p className="text-sm text-muted-foreground">
            {isUploading ? "Uploading..." : "Drag & drop or click to upload"}
          </p>
        </div>
      </div>
      {value && value.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          {value.map((url) => (
            <div key={url} className="relative w-24 h-24 rounded-md overflow-hidden">
              <div className="absolute top-1 right-1 z-10">
                <button type="button" onClick={() => onRemove(url)} className="bg-rose-500 text-white p-1 rounded-full">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Image fill className="object-cover" alt="Image" src={url || "/placeholder.svg"} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
