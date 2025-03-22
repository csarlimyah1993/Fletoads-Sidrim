"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"

interface ThemeContextProps {
  theme: "light" | "dark"
  setTheme: (theme: "light" | "dark") => void
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "light",
  setTheme: () => {},
})

interface ThemeProviderProps {
  attribute?: string
  defaultTheme?: "system" | "light" | "dark"
  enableSystem?: boolean
  disableTransitionOnChange?: boolean
  children: React.ReactNode
}

export function ThemeProvider({
  attribute = "class",
  defaultTheme = "system",
  enableSystem = true,
  disableTransitionOnChange = false,
  children,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    let mounted = true

    const localStorageTheme = localStorage.getItem("theme") as "light" | "dark" | null

    if (localStorageTheme) {
      setTheme(localStorageTheme)
      applyTheme(localStorageTheme)
    } else if (defaultTheme === "system" && enableSystem) {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      setTheme(systemTheme)
      applyTheme(systemTheme)
    } else {
      setTheme(defaultTheme === "dark" ? "dark" : "light")
      applyTheme(defaultTheme === "dark" ? "dark" : "light")
    }

    function applyTheme(theme: "light" | "dark") {
      if (!mounted) return

      const root = window.document.documentElement

      if (attribute === "class") {
        root.classList.remove(theme === "light" ? "dark" : "light")
        root.classList.add(theme)
      } else {
        root.style.colorScheme = theme
      }
    }

    return () => {
      mounted = false
    }
  }, [attribute, defaultTheme, enableSystem])

  useEffect(() => {
    localStorage.setItem("theme", theme)

    if (disableTransitionOnChange) {
      document.documentElement.classList.add("[&_*]:!transition-none")
      window.setTimeout(() => {
        document.documentElement.classList.remove("[&_*]:!transition-none")
      }, 0)
    }
  }, [theme, disableTransitionOnChange])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}

