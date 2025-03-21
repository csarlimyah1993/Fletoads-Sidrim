import { Metadata } from "next"
import { Header } from "@/components/header"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export const metadata: Metadata = {
  title: "Dashboard | FletoAds",
  description: "Visualize o desempenho da sua loja",
}

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Dashboard" />
      <main className="flex-1">
        <div className="container py-6">
          <DashboardContent />
        </div>
      </main>
    </div>
  )
}