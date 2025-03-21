import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const path = searchParams.get("path")

  if (!path) {
    return NextResponse.json({ error: "Path is required" }, { status: 400 })
  }

  // This is a simple implementation that redirects to a placeholder
  // In a real implementation, you would fetch the image from your blob storage
  return NextResponse.redirect(`/placeholder.svg?height=400&width=400&text=${path}`)
}

