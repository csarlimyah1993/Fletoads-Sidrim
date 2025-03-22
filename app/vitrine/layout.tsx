import type { ReactNode } from "react"
import "../globals.css"

export default function VitrineLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">{children}</body>
    </html>
  )
}

