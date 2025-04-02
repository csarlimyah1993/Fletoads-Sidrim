import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export default async function PerfilDaLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Connect to database
  await connectToDatabase()

  // Check if user has a store profile
  let hasStore = false

  try {
    // Get database connection
    const connection = mongoose.connection
    if (!connection || !connection.db) {
      throw new Error("Database connection not established")
    }

    const db = connection.db

    // Find user
    const usuario = await db.collection("usuarios").findOne({
      email: session.user.email,
    })

    if (!usuario) {
      throw new Error("User not found")
    }

    // Check if user has a store
    const loja = await db.collection("lojas").findOne({
      usuarioId: usuario._id.toString(),
    })

    hasStore = !!loja
  } catch (error) {
    console.error("Error checking store profile:", error)
  }

  // Redirect based on whether user has a store or not
  if (hasStore) {
    redirect("/dashboard/perfil-da-loja")
  } else {
    redirect("/dashboard/perfil-da-loja/criar")
  }

  // This will never be reached due to redirects, but TypeScript requires a return
  return null
}

