"use client"

import { Phone } from "lucide-react"
import { useState, useEffect } from "react"

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false)
  const phoneNumber = "+92992210808"
  const message = "Olá! Vim pelo site FletoAds."

  // Only show button after page is fully loaded and after a small delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const handleClick = () => {
    // Format the WhatsApp URL
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`
    // Open in a new tab
    window.open(whatsappUrl, "_blank")
  }

  if (!isVisible) return null

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      aria-label="Contato via WhatsApp"
    >
      <div className="absolute animate-ping w-16 h-16 rounded-full bg-green-400 opacity-75"></div>
      <Phone className="w-8 h-8" />
    </button>
  )
}

