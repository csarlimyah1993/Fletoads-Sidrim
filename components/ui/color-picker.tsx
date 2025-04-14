"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "./input"
import { Label } from "./label"

interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string // Adicionando a propriedade label como opcional
}

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(color)

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value
    setInputValue(newColor)
    onChange(newColor)
  }

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex items-center gap-2">
        <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: color }} />
        <Input type="color" value={inputValue} onChange={handleColorChange} className="w-16 h-10 p-1" />
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value)
            if (/^#([0-9A-F]{3}){1,2}$/i.test(e.target.value)) {
              onChange(e.target.value)
            }
          }}
          className="flex-1"
          placeholder="#RRGGBB"
        />
      </div>
    </div>
  )
}
