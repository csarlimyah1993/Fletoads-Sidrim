// app/api/diagnostico/route.ts

import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Simulate a diagnostic check
    const diagnosticResult = {
      status: "ok",
      message: "System is healthy",
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(diagnosticResult)
  } catch (error) {
    console.error("Error during diagnostic check:", error)
    return NextResponse.json(
      { status: "error", message: "Diagnostic check failed", error: String(error) },
      { status: 500 },
    )
  }
}

