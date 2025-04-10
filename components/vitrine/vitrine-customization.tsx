"use client"

// Update the ImageUpload usage in vitrine-customization.tsx
// Find the sections with ImageUpload and update them:

import { useState } from "react"
import { ImageUpload } from "@/components/ui/image-upload"

const VitrineCustomization = () => {
  const [logoUrl, setLogoUrl] = useState<string>("")
  const [bannerUrl, setBannerUrl] = useState<string>("")
  const endpoint = "upload" // Or fetch this from a config

  // For the logo upload:
  return (
    <div>
      <ImageUpload
        value={logoUrl ? [logoUrl] : []}
        endpoint={endpoint}
        onChange={(url) => setLogoUrl(url)}
        onRemove={() => setLogoUrl("")}
        onUploadComplete={(url: string) => setLogoUrl(url)}
      />

      {/* For the banner upload: */}
      <ImageUpload
        value={bannerUrl ? [bannerUrl] : []}
        endpoint={endpoint}
        onChange={(url) => setBannerUrl(url)}
        onRemove={() => setBannerUrl("")}
        onUploadComplete={(url: string) => setBannerUrl(url)}
      />
    </div>
  )
}

export default VitrineCustomization
