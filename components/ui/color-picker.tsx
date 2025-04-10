"use client"

import type React from "react"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

export function ColorPicker({ value, onChange, className }: ColorPickerProps) {
  const [color, setColor] = useState(value || "#000000")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setColor(newColor)
    onChange(newColor)
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-10 h-10 p-0 border-2" style={{ backgroundColor: color }}>
            <span className="sr-only">Escolher cor</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-3">
          <input type="color" value={color} onChange={handleChange} className="w-32 h-32 cursor-pointer" />
        </PopoverContent>
      </Popover>
      <input type="text" value={color} onChange={handleChange} className="w-24 px-2 py-1 border rounded" />
    </div>
  )
}
