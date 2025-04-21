import type { Metadata } from "next"
import CheckoutClient from "./client"

export const metadata: Metadata = {
  title: "Checkout - FletoAds",
  description: "Finalize sua assinatura e comece a usar o FletoAds agora mesmo.",
}

export default function CheckoutPage() {
  return <CheckoutClient />
}
