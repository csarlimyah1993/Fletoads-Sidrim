import { NextResponse } from "next/server"

export async function GET() {
  try {
    return NextResponse.json({ status: "ok", message: "API está funcionando corretamente" })
  } catch (error) {
    console.error("Erro na verificação de conexão:", error)
    return NextResponse.json({ status: "error", message: "Erro na verificação de conexão" }, { status: 500 })
  }
}
