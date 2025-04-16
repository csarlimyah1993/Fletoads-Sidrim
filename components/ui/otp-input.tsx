"use client"

import React, { useState, useEffect, useRef } from "react"

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
  numInputs: number
  renderInput: (props: React.InputHTMLAttributes<HTMLInputElement>) => React.ReactNode
  inputStyle?: string
  containerStyle?: string
}

export const OTPInput: React.FC<OTPInputProps> = ({
  value,
  onChange,
  numInputs,
  renderInput,
  inputStyle,
  containerStyle,
}) => {
  const [otp, setOtp] = useState(value)
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])

  useEffect(() => {
    setOtp(value)
  }, [value])

  const handleChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    if (!/^[0-9]$/.test(newValue) && newValue !== "") {
      return
    }

    const otpArray = otp.split("")
    otpArray[index] = newValue
    const newOtp = otpArray.join("")
    setOtp(newOtp)
    onChange(newOtp)

    if (newValue !== "" && index < numInputs - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault()
    const pastedValue = event.clipboardData.getData("text")

    if (/^\d+$/.test(pastedValue) && pastedValue.length === numInputs) {
      setOtp(pastedValue)
      onChange(pastedValue)
    }
  }

  return (
    <div className={containerStyle} onPaste={handlePaste}>
      {Array(numInputs)
        .fill("")
        .map((_, index) => (
          <React.Fragment key={index}>
            {renderInput({
              type: "text",
              maxLength: 1,
              value: otp[index] || "",
              onChange: (event) => handleChange(index, event as React.ChangeEvent<HTMLInputElement>),
              onKeyDown: (event) => handleKeyDown(index, event as React.KeyboardEvent<HTMLInputElement>),
              className: inputStyle,
              ref: (el) => (inputRefs.current[index] = el),
              "data-index": index,
              inputMode: "numeric",
              autoComplete: "one-time-code",
            })}
          </React.Fragment>
        ))}
    </div>
  )
}
