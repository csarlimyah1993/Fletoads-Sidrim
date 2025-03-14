import { Header } from "@/components/header"
import { HomeContent } from "@/components/home-content"
import { WeatherTimeWidget } from "@/components/weather-time-widget"

export default function HomePage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <WeatherTimeWidget />
        <HomeContent />
      </div>
    </>
  )
}

