// Singleton pattern to ensure Google Maps is loaded only once
let isLoaded = false
let loadPromise: Promise<void> | null = null

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (isLoaded) {
    return Promise.resolve()
  }

  if (loadPromise) {
    return loadPromise
  }

  // Check if the script is already in the document
  if (document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]')) {
    isLoaded = true
    return Promise.resolve()
  }

  loadPromise = new Promise((resolve, reject) => {
    // Create script element
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`
    script.async = true
    script.defer = true

    // Set up callbacks
    window.initMap = () => {
      isLoaded = true
      resolve()
    }

    script.onerror = (error) => {
      loadPromise = null
      reject(new Error(`Google Maps failed to load: ${error}`))
    }

    // Append script to document
    document.head.appendChild(script)
  })

  return loadPromise
}

// Add this to the window type
declare global {
  interface Window {
    initMap: () => void
  }
}
