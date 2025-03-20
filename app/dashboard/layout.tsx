import type { ReactNode } from "react"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FletoAds - Dashboard",
  description: "Gerencie seus panfletos digitais e campanhas",
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return <>{children}</>
}

