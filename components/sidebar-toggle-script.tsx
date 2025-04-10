"use client"

import { useEffect } from "react"

export function SidebarToggleScript() {
  useEffect(() => {
    const updateMainContentMargin = () => {
      const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true"
      const mainContent = document.getElementById("main-content")

      if (mainContent) {
        if (isCollapsed) {
          mainContent.classList.remove("md:ml-64")
          mainContent.classList.add("ml-[70px]")
        } else {
          mainContent.classList.remove("ml-[70px]")
          mainContent.classList.add("md:ml-64")
        }
      }
    }

    // Executar uma vez na montagem
    updateMainContentMargin()

    // Adicionar listener para mudanças no localStorage
    const handleStorageChange = () => {
      updateMainContentMargin()
    }

    window.addEventListener("storage", handleStorageChange)

    // Criar um MutationObserver para detectar mudanças no DOM
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
          updateMainContentMargin()
        }
      })
    })

    const sidebar = document.querySelector("[data-sidebar]")
    if (sidebar) {
      observer.observe(sidebar, { attributes: true })
    }

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      observer.disconnect()
    }
  }, [])

  return null
}
