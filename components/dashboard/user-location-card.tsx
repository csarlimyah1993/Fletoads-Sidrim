import type React from "react"

interface GoogleMapProps {
  latitude: number
  longitude: number
  address: string
  storeName: string
  height: string
  zoom: number
}

const GoogleMap: React.FC<GoogleMapProps> = ({ latitude, longitude, address, storeName, height, zoom }) => {
  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=${zoom}&output=embed`

  return (
    <div className="w-full rounded-md overflow-hidden border mt-2">
      <iframe
        width="100%"
        height={height}
        src={mapUrl}
        title={storeName}
        style={{ border: 0 }}
        aria-label={`Mapa de ${storeName} em ${address}`}
      />
    </div>
  )
}

interface UserLocationCardProps {
  latitude?: number | null
  longitude?: number | null
  addressDisplay?: string | null
  cidade?: string | null
}

const UserLocationCard: React.FC<UserLocationCardProps> = ({ latitude, longitude, addressDisplay, cidade }) => {
  const hasCoordinates = latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined

  return (
    <div>
      {hasCoordinates ? (
        <GoogleMap
          address={addressDisplay || ""}
          latitude={latitude}
          longitude={longitude}
          storeName={cidade || "Localização"}
          height="180px"
          zoom={15}
        />
      ) : (
        <div className="h-[180px] w-full flex items-center justify-center bg-muted/30 rounded-md border mt-2">
          <p className="text-sm text-muted-foreground">Coordenadas não disponíveis</p>
        </div>
      )}
    </div>
  )
}

export default UserLocationCard
