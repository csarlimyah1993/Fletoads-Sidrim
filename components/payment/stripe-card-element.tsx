"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { loadStripe, type Stripe, type StripeElements, type StripeCardElement } from "@stripe/stripe-js"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"

// Initialize Stripe outside of the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface StripeCardElementProps {
  onSuccess: (paymentMethodId: string) => void
  onCancel: () => void
  isSubmitting: boolean
}

export default function StripeCardElement({ onSuccess, onCancel, isSubmitting }: StripeCardElementProps) {
  const [stripe, setStripe] = useState<Stripe | null>(null)
  const [elements, setElements] = useState<StripeElements | null>(null)
  const [cardElement, setCardElement] = useState<StripeCardElement | null>(null)
  const [cardholderName, setCardholderName] = useState("")
  const [error, setError] = useState<string | null>(null)

  // Initialize Stripe and Elements
  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await stripePromise
      if (stripeInstance) {
        setStripe(stripeInstance)
        const elementsInstance = stripeInstance.elements()
        setElements(elementsInstance)

        const cardElementInstance = elementsInstance.create("card", {
          style: {
            base: {
              fontSize: "16px",
              color: "#32325d",
              fontFamily: "system-ui, -apple-system, sans-serif",
              "::placeholder": {
                color: "#a0aec0",
              },
            },
            invalid: {
              color: "#e53e3e",
              iconColor: "#e53e3e",
            },
          },
        })

        cardElementInstance.mount("#card-element")
        setCardElement(cardElementInstance)

        // Listen for changes and display any errors
        cardElementInstance.on("change", (event) => {
          setError(event.error ? event.error.message : null)
        })
      }
    }

    initializeStripe()

    // Cleanup function
    return () => {
      if (cardElement) {
        cardElement.destroy()
      }
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements || !cardElement) {
      // Stripe.js has not loaded yet
      return
    }

    try {
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: cardholderName,
        },
      })

      if (error) {
        setError(error.message || "Erro ao processar o cartão")
        return
      }

      if (paymentMethod) {
        onSuccess(paymentMethod.id)
      }
    } catch (err) {
      console.error("Erro ao criar método de pagamento:", err)
      setError("Ocorreu um erro ao processar seu cartão")
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="cardholder-name">Nome no Cartão</Label>
          <Input
            id="cardholder-name"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
            placeholder="Nome como aparece no cartão"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="card-element">Dados do Cartão</Label>
          <div
            id="card-element"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Processando..." : "Adicionar Cartão"}
        </Button>
      </div>
    </form>
  )
}
