"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GoogleMap } from "@/components/ui/google-map"
import { MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VitrineLocationProps {
  name: string
  address: string
  latitude: number
  longitude: number
}

export function VitrineLocation({ name, address, latitude, longitude }: VitrineLocationProps) {
  const openGoogleMaps = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`, "_blank")
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex items-center">
          <MapPin className="h-5 w-5 mr-2" />
          Localização
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-[200px] w-full rounded-md overflow-hidden">
          <GoogleMap
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
            defaultCenter={{ lat: latitude, lng: longitude }}
            defaultZoom={15}
            markers={[
              {
                position: { lat: latitude, lng: longitude },
                title: name,
              },
            ]}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium">{name}</p>
          <p className="text-sm text-muted-foreground">{address}</p>
          <Button variant="outline" size="sm" className="w-full mt-2" onClick={openGoogleMaps}>
            <Navigation className="h-4 w-4 mr-2" />
            Como chegar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
