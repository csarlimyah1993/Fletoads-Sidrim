"use client"

import { LocationPicker } from "@/components/maps/location-picker"

export default function LocationPage() {
  // In a real app, you would get this from an environment variable
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    console.log("Selected location:", location)
    // Here you would typically save this to your backend
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Localização do Negócio</h1>

      <div className="max-w-2xl">
        <LocationPicker apiKey={googleMapsApiKey} onLocationSelect={handleLocationSelect} />
      </div>
    </div>
  )
}
