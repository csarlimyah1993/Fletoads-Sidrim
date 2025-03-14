"use client"

import type React from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ResponsiveLayoutProps {
  children: React.ReactNode
}

export function ResponsiveLayout({ children }: ResponsiveLayoutProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  return <div className={`mx-auto w-full transition-all duration-300 ${isMobile ? "px-4" : "px-6"}`}>{children}</div>
}

