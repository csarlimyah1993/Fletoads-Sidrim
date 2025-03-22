"use client"

import { Button } from "@/components/ui/button"
import { Palette } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function PersonalizeButton() {
  const pathname = usePathname()
  const isVitrinePreview = pathname.includes("/vitrine/")

  if (!isVitrinePreview) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className="bg-transparent border-purple-600 text-purple-600 hover:bg-purple-600/10"
      asChild
    >
      <Link href="/dashboard/vitrine">
        <Palette className="mr-2 h-4 w-4" />
        Personalizar Vitrine
      </Link>
    </Button>
  )
}

