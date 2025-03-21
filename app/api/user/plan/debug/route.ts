import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({ status: "ok", message: "Rota de debug funcionando" })
}

