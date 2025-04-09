declare global {
    interface Window {
      google: typeof google
      googleMapsInitCallback?: () => void
      [key: string]: any
    }
  }
  
  declare var google: any
  
  export {}
  
  