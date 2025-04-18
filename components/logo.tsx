import type React from "react"
import { cn } from "@/lib/utils"

interface LogoProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  showText?: boolean
}

export function Logo({ className, showText = false, ...props }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      {/* SVG Logo */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("h-6 w-6", className)}
        {...props}
      >
        <path d="M5 3a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z" />
        <path d="M8 9h8" />
        <path d="M8 13h5" />
        <path d="M8 17h2" />
      </svg>

      {/* Logo text - only shown when showText is true */}
      {showText && (
        <div className="font-semibold text-xl">
          <span className="text-primary">fleto</span>
          <span className="text-foreground">Ads</span>
        </div>
      )}
    </div>
  )
}
