"use client"

import { useState, useEffect } from "react"

type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl"

const breakpoints: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

export function useResponsive() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("xs")
  const [width, setWidth] = useState(0)

  useEffect(() => {
    // Set initial width
    setWidth(window.innerWidth)

    // Update breakpoint based on width
    const updateBreakpoint = () => {
      const newWidth = window.innerWidth
      setWidth(newWidth)

      if (newWidth >= breakpoints["2xl"]) {
        setBreakpoint("2xl")
      } else if (newWidth >= breakpoints.xl) {
        setBreakpoint("xl")
      } else if (newWidth >= breakpoints.lg) {
        setBreakpoint("lg")
      } else if (newWidth >= breakpoints.md) {
        setBreakpoint("md")
      } else if (newWidth >= breakpoints.sm) {
        setBreakpoint("sm")
      } else {
        setBreakpoint("xs")
      }
    }

    // Set initial breakpoint
    updateBreakpoint()

    // Add event listener
    window.addEventListener("resize", updateBreakpoint)

    // Cleanup
    return () => window.removeEventListener("resize", updateBreakpoint)
  }, [])

  const isAbove = (bp: Breakpoint) => width >= breakpoints[bp]
  const isBelow = (bp: Breakpoint) => width < breakpoints[bp]

  return {
    breakpoint,
    width,
    isAbove,
    isBelow,
    isMobile: isBelow("md"),
    isTablet: isAbove("md") && isBelow("lg"),
    isDesktop: isAbove("lg"),
  }
}

