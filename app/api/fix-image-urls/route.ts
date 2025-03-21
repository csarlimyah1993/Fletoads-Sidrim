import { NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { getTempImageUrl } from "@/lib/temp-images"

export async function GET() {
  try {
    const mongoose = await connectToDatabase()
    const db = mongoose.connection.db

    if (!db) {
      throw new Error("Database connection failed")
    }

    // Corrigir URLs de imagens nas lojas
    const lojas = await db
      .collection("lojas")
      .find({
        $or: [{ logo: { $regex: "via.placeholder.com" } }, { banner: { $regex: "via.placeholder.com" } }],
      })
      .toArray()

    for (const loja of lojas) {
      const updates: any = {}

      if (loja.logo && loja.logo.includes("via.placeholder.com")) {
        updates.logo = getTempImageUrl("logo", loja._id.toString())
      }

      if (loja.banner && loja.banner.includes("via.placeholder.com")) {
        updates.banner = getTempImageUrl("banner", loja._id.toString())
      }

      if (Object.keys(updates).length > 0) {
        await db.collection("lojas").updateOne({ _id: new ObjectId(loja._id) }, { $set: updates })
      }
    }

    // Corrigir URLs de imagens nos produtos
    const produtos = await db
      .collection("produtos")
      .find({
        imagem: { $regex: "via.placeholder.com" },
      })
      .toArray()

    for (const produto of produtos) {
      await db
        .collection("produtos")
        .updateOne(
          { _id: new ObjectId(produto._id) },
          { $set: { imagem: getTempImageUrl("product", produto._id.toString()) } },
        )
    }

    // Corrigir URLs de imagens nos usuários
    const usuarios = await db
      .collection("usuarios")
      .find({
        avatar: { $regex: "via.placeholder.com" },
      })
      .toArray()

    for (const usuario of usuarios) {
      await db
        .collection("usuarios")
        .updateOne(
          { _id: new ObjectId(usuario._id) },
          { $set: { avatar: getTempImageUrl("avatar", usuario._id.toString()) } },
        )
    }

    return NextResponse.json({
      success: true,
      message: "URLs de imagens corrigidas com sucesso",
    })
  } catch (error) {
    console.error("Erro ao corrigir URLs de imagens:", error)
    return NextResponse.json({ success: false, error: "Erro ao corrigir URLs de imagens" }, { status: 500 })
  }
}

