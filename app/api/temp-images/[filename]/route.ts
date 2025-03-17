import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import path from "path"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest, { params }: { params: { filename: string } }) {
  try {
    const filename = params.filename

    // Validate filename to prevent directory traversal
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return new NextResponse("Invalid filename", { status: 400 })
    }

    const filePath = path.join(process.cwd(), "public", "temp-uploads", filename)

    try {
      const fileBuffer = await readFile(filePath)

      // Determine content type based on file extension
      const extension = filename.split(".").pop()?.toLowerCase() || ""
      let contentType = "application/octet-stream"

      if (extension === "jpg" || extension === "jpeg") contentType = "image/jpeg"
      else if (extension === "png") contentType = "image/png"
      else if (extension === "gif") contentType = "image/gif"
      else if (extension === "webp") contentType = "image/webp"

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      })
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error)
      return new NextResponse("File not found", { status: 404 })
    }
  } catch (error) {
    console.error("Error serving temp image:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

